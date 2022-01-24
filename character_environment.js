var control={
  up: "UP_ARROW", // 32=spaceBar
  left: 'LEFT_ARROW',
  right: 'RIGHT_ARROW',
  revive: 32
}

//Inner game status, which might affect game balance or playability.
var gameConfig={
  
  // start, playing, over
  status: "start", 
  
  // initial lives of mario
  initialLifes: 4,

  // character moves speed
  moveSpeed: 5,
  enemyMoveSpeed: 1,

  // gravity and jump speed for all the characters
  gravity: 1,
  gravityEnemy: 10,
  jump:-15,

  // character starting point
  startingPointX: 500,
  startingPointY: 0,

  // default canvas size
  screenX:1240,
  screenY:336,

  // scores
  timeScores: 0,
  scores: 0
}


/*=====  End of Variables  ======*/


/*====================================
=            Game Status             =
====================================*/

function game(){

  instializeInDraw();
  moveEnvironment(mario);
  drawSprites();
  
  if(gameConfig.status==='start'){

    fill(0,0,0,150);
    rect(0,0,gameConfig.screenX,gameConfig.screenY);

    fill(255, 255, 255);
    textSize(40);
    textAlign(CENTER);
    text("Press Any Arrow Keys to Start and Play ", gameConfig.screenX/2, gameConfig.screenY/2);
    textSize(40);

    stroke(255);
    strokeWeight(7);
    noFill();

    changeGameStatud();
  }
  
  if(gameConfig.status==='play'){
    positionOfCharacter(mario);
    enemys(enemyMushrooms);
    checkStatus(mario);
    scores(mario);
    manualControl(mario);
  
    // optional control version of game
    // autoControl(mario);
  
  }

    // if game is over 
  if(gameConfig.status==='gameover'){
    fill(0,0,0,150);
    rect(0,0,gameConfig.screenX,gameConfig.screenY);

    fill(255, 255, 255);
    textSize(40);
    textAlign(CENTER);
    text("GAME OVER", gameConfig.screenX/2, gameConfig.screenY/2+105);
    textSize(15);
    text("Press SPACE to Restart", gameConfig.screenX/2, gameConfig.screenY/2+135);
    textSize(40);
    text(round(gameConfig.scores),gameConfig.screenX/2,gameConfig.screenY/2-35);
    text("points",gameConfig.screenX/2,gameConfig.screenY/2);

    stroke(255);
    strokeWeight(7);
    noFill();
    ellipse(gameConfig.screenX/2,gameConfig.screenY/2-30,160,160)
    changeGameStatud(mario)
  }
}  
function startGame()
{
  GameStatus = "start";
  document.getElementById("status").innerHTML = "Game Is Loading";
}

// change game status if any key is pressed
function changeGameStatud(character){
 if(noseX !="" && gameConfig.status==="start" && GameStatus=="start") { 
   document.getElementById("status").innerHTML = "Game Is Loaded";
   world_start.play();
 initializeCharacterStatus(mario)
    gameConfig.status= "play"
  }
  if(gameConfig.status==="gameover" && keyDown(control.revive)) {
    gameConfig.status= "start"        
  }
}




/*=====  End of Game Status   ======*/


/*=============================================
=                 Instialize                  =
=============================================*/

//initialize
function instializeInSetup(character){
	frameRate(120);
	
	character.scale=0.35;
	initializeCharacterStatus(character)

  bricks.displace(bricks);
	platforms.displace(platforms);
	coins.displace(coins);
	coins.displace(platforms);
	coins.collide(pipes);
	coins.displace(bricks);		

  // change the scale of clouds
	clouds.forEach(function(element){
		element.scale=random(1,2);
	})
}

function initializeCharacterStatus(character){
  // set up the initial config of character  
  character.scale=0.35;
  character["killing"]=0; //while is killing enemy
  character["kills"]=0;
  character["live"]=true;
  character["liveNumber"]=gameConfig.initialLifes;
  character["status"]='live';
  character["coins"]=0;
  character["dying"]=0;
  character.position.x=gameConfig.startingPointX;
  character.position.y=gameConfig.startingPointY;
}

function instializeInDraw(){
  background(109,143,252);
  
  //while killing
  if(mario.killing>0){
    mario.killing-=1;
  }else{
    mario.killing=0;
  }
  
  // make objects not overlap each other.
  pipes.displace(pipes);
  enemyMushrooms.displace(enemyMushrooms);
  enemyMushrooms.collide(pipes);
  clouds.displace(clouds);

  // make character not overlap other objects
  if(mario.live){
    bricks.displace(mario);
    pipes.displace(mario);
    enemyMushrooms.displace(mario);
    platforms.displace(mario);
  }
  
  // character config initialize
  mario["standOnObj"]=false;
  mario.velocity.x=0;
  mario.maxSpeed=20;

}

/*=====       End of Instialize        ======*/



/*============================================
=            Interactive Elements            =
============================================*/

// Character get coins
function getCoins(coin,character){
  if( character.overlap(coin) && character.live && coin.get==false){
    character.coins+=1;
    coin.get=true;
    mario_coin.play();
  };
}
    
// Reappear coin after goin is got.
function coinVanish(coin){
  if(coin.get){
    coin.position.x=random(50,gameConfig.screenX)+gameConfig.screenX;
    coin.get=false;
  };
}

/*=====  End of Interactive Elements  ======*/


/*=============================================
=    Main character setting and control       =
=============================================*/

/* Make main character standing on objs */
function positionOfCharacter(character){
  
  // Not on the platform
  if(character.live){
    
    // See if standing on bricks
    platforms.forEach(function(element){ standOnObjs(character,element); });
    bricks.forEach(function(element){ standOnObjs(character,element); });
    pipes.forEach(function(element){ standOnObjs(character,element); });
    
    // Character affected by gravity
    falling(character);

    // If character can only jump if standing on the object
    if(character.standOnObj) jumping(character);
      
  }

  // Coins interaction event
  coins.forEach(function(element){
    getCoins(element,mario);
    coinVanish(element);
  });

  // EnemyMushrooms interaction event
  enemyMushrooms.forEach(function(element){
    StepOnEnemy(character,element);
    if((element.touching.left||element.touching.right)&&character.live&&character.killing===0) die(mario);
    
  })

  // Make it stay in the screen
  dontGetOutOfScreen(mario);

}

/* Auto moving character  */
function autoControl(character){
    character.velocity.x+=gameConfig.moveSpeed;
    character.changeAnimation('move');
    character.mirrorX(1);
}
