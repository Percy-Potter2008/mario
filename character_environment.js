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
function manualControl(character){
  
  if(character.live){
    if(noseX < 300){
      character.velocity.x-=gameConfig.moveSpeed;
      character.changeAnimation('move');
      character.mirrorX(-1);
    }

    if(noseX > 300){
        character.velocity.x+=gameConfig.moveSpeed;
      character.changeAnimation('move');
      character.mirrorX(1);
    }

    if(!keyDown(control.left)&&!keyDown(control.right)&&!keyDown(control.up)){ 
      character.changeAnimation('stand');
    }
  }
 
}

/* Movements of character */
function jumping(character){
	if( (noseY < 168  &&character.live) || (touchIsDown&&character.live) ){
    character.velocity.y+=gameConfig.jump;
    mario_jump.play();
	}
}


/* Movements of character */
function falling(character){
	character.velocity.y += gameConfig.gravity;
  character.changeAnimation('jump');
}


/* See if  obj1 stand on obj2, mainly for see if standing on the objcs*/
function standOnObjs(obj1,obj2){
  
	var obj1_Left=leftSide(obj1);
	var obj1_Right=rightSide(obj1);
	var obj1_Up=upSide(obj1);
	var obj1_Down=downSide(obj1);

	var obj2_Left=leftSide(obj2);
	var obj2_Right=rightSide(obj2);
	var obj2_Up=upSide(obj2);
	var obj2_Down=downSide(obj2);

	if(obj1_Right>=obj2_Left&&obj1_Left<=obj2_Right && obj1_Down<=obj2_Up+7 && obj1_Down>=obj2_Up-7){
		// println("YES");
		obj1.velocity.y = 0;
		obj1.position.y=obj2_Up-(obj1.height/2)-1;
		obj1.standOnObj= true;
	}
}

/* See if  obj1 step on obj2 to kill it*/
function StepOnEnemy(obj1,obj2){
  
	var obj1_Left=leftSide(obj1);
	var obj1_Right=rightSide(obj1);
	var obj1_Up=upSide(obj1);
	var obj1_Down=downSide(obj1);

	var obj2_Left=leftSide(obj2);
	var obj2_Right=rightSide(obj2);
	var obj2_Up=upSide(obj2);
	var obj2_Down=downSide(obj2);

	if(obj1_Right>=obj2_Left&&obj1_Left<=obj2_Right && obj1_Down<=obj2_Up+7 && obj1_Down>=obj2_Up-7 && obj2.live==true && obj2.touching.top){
		obj2.live=false;
    obj1.killing=30;
    obj1.kills++;
    if(obj1.velocity.y>=gameConfig.jump*0.8){
      obj1.velocity.y=gameConfig.jump*0.8;
    }else{
      obj1.velocity.y+=gameConfig.jump*0.8;
    }
    mario_kick.play();
	}
}


// make character die if he touched by enemy
function die(character){
    character.live=false;
    character.dying+=120;
    character.liveNumber--;
    character.status="dead";
    character.changeAnimation('dead');
    character.velocity.y-=2;
    console.log("die - " + character.liveNumber);
    if(character.liveNumber > 0)
    {
      mario_die.play();
    }
}

// check character status and response to sprite and game status
function checkStatus(character){    
  if(character.live==false){
    character.changeAnimation('dead');
    character.dying-=1;
    reviveAfterMusic(character);
  }
  if(character.live==false && character.liveNumber==0){
    gameConfig.status="gameover";
    mario_gameover.play();
  }

}

// revive after dying music finished
function reviveAfterMusic(character){
  if( character.live === false && mario.liveNumber !==0 && character.dying===0 ){
    character.live=true;
    character.status="live";
    character.position.x=500;
    character.position.y=40;
    character.velocity.y=0;
  }
}


/* Make character stay in screen */
function dontGetOutOfScreen(character){
  
  //if mario drop in the holes 
  if(character.position.y>gameConfig.screenY&&character.live && character==mario){
    die(mario);
  }

  if(character.position.x>gameConfig.screenX-(character.width*0.5)){
  	character.position.x=gameConfig.screenX-(character.width*0.5);
  }else if(character.position.x<character.width*0.5){
    if(character==mario){
      character.position.x=character.width*0.5;
    }else{ 
      character.live=false; 
    }
  }

}
