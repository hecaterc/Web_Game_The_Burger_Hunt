// The point and size class used in this program
function Point(x, y) {
    this.x = (x)? parseFloat(x) : 0.0;
    this.y = (y)? parseFloat(y) : 0.0;
}

function Size(w, h) {
    this.w = (w)? parseFloat(w) : 0.0;
    this.h = (h)? parseFloat(h) : 0.0;
}

// Helper function for checking intersection between two rectangles
function intersect(pos1, size1, pos2, size2) {
    return (pos1.x < pos2.x + size2.w && pos1.x + size1.w > pos2.x &&
            pos1.y < pos2.y + size2.h && pos1.y + size1.h > pos2.y);
}


// The player class used in this program
function Player() {
    this.node = document.getElementById("player");
    this.position = PLAYER_INIT_POS;
    this.motion = motionType.NONE;
    this.verticalSpeed = 0;
    this.facing = motionType.RIGHT;
    this.name = name;
}

Player.prototype.isOnPlatform = function() {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        if (parseFloat(node.getAttribute("opacity")) <= 0) continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (((this.position.x + PLAYER_SIZE.w > x && this.position.x < x + w) ||
             ((this.position.x + PLAYER_SIZE.w) == x && this.motion == motionType.RIGHT) ||
             (this.position.x == (x + w) && this.motion == motionType.LEFT)) &&
            (this.position.y + PLAYER_SIZE.h == y) || 
            playerOnVerticalPlatform(player.position, player.motion, PLAYER_SIZE)) return true;
    }
    if (this.position.y + PLAYER_SIZE.h == SCREEN_SIZE.h) return true;

    return false;
}

Player.prototype.collidePlatform = function(position) {
    var platforms = document.getElementById("platforms");
    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;
        if (playerOnVerticalPlatform(player.position, player.motion,PLAYER_SIZE)) continue;
        if (parseFloat(node.getAttribute("opacity")) <= 0) continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));
        var pos = new Point(x, y);
        var size = new Size(w, h);

        if (intersect(position, PLAYER_SIZE, pos, size)) {
            position.x = this.position.x;
            if (intersect(position, PLAYER_SIZE, pos, size)) {
                if (this.position.y >= y + h)
                    position.y = y + h;
                else
                    position.y = y - PLAYER_SIZE.h;
                this.verticalSpeed = 0;
            }
        }
    }
}

Player.prototype.collideScreen = function(position) {
    if (position.x < 0) position.x = 0;
    if (position.x + PLAYER_SIZE.w > SCREEN_SIZE.w) position.x = SCREEN_SIZE.w - PLAYER_SIZE.w;
    if (position.y < 0) {
        position.y = 0;
        this.verticalSpeed = 0;
    }
    if (position.y + PLAYER_SIZE.h > SCREEN_SIZE.h) {
        position.y = SCREEN_SIZE.h - PLAYER_SIZE.h;
        this.verticalSpeed = 0;
    }
}


//
// Below are constants used in the game
//
var PLAYER_SIZE = new Size(40, 40);         // The size of the player
var SCREEN_SIZE = new Size(600, 560);       // The size of the game screen
var PLAYER_INIT_POS  = new Point(0, 0);   // The initial position of the player

var MOVE_DISPLACEMENT = 5;                  // The speed of the player in motion
var JUMP_SPEED = 15;                        // The speed of the player jumping
var VERTICAL_DISPLACEMENT = 1;              // The displacement of vertical speed

var GAME_INTERVAL = 25;                     // The time interval of running the game

var BULLET_SIZE = new Size(10, 10);         // The speed of a bullet
var BULLET_SPEED = 10.0;                    // The speed of a bullet
var bulletNum = 8;
                                            //  = pixels it moves each game loop
var SHOOT_INTERVAL = 200.0;                 // The period when shooting is disabled
var canShoot = true;                        // A flag indicating whether the player can shoot a bullet

var MONSTER_SIZE = new Size(40, 40);      
var score = 0;
var VERTICAL_PLATFORM_SPEED = 1;
var isUp = true;
var monsterNum = 5;
//var playerObject = document.getElementById("player");
//var left = false;
//var right = true;
var level = 1;
var name = "";

var timer  = null;
var TIME_ALLOWED = 60;
var time_remaining = TIME_ALLOWED;
var monster_location = new Array();
var monster_facing = new Array();
var monster_speed = 1;

var BURGER_SIZE = new Size(40, 40);

//
// Variables in the game
//
var motionType = {NONE:0, LEFT:1, RIGHT:2}; // Motion enum

var player = null;                          // The player object
var gameInterval = null;                    // The interval

var canBossShoot = true;
var isBossAlive = true;

var PORTAL_SIZE = new Size(40, 40);
var canTp = true;
var portalIn = new Point(0, 120);
var portalOut = new Point(0, 420);

var bgm = new Audio('bgm.mp3');
var kill = new Audio('kill.mp3');
var lose = new Audio('lose.mp3');
var shoot = new Audio('shoot.mp3');
var win = new Audio('win.mp3');

var EXIT_SIZE = new Size(40, 40);
var exit = new Point(540, 480);
//
// The load function
//
function load() {
    document.getElementById("startscreen").style.display = "none";
    document.getElementById("highscoretable").style.setProperty("visibility", "hidden", null);
    
    // Attach keyboard events
    document.documentElement.addEventListener("keydown", keydown, false);
    document.documentElement.addEventListener("keyup", keyup, false);
    //verticalPlatform.setAttribute("y", 300);
    isMoving = true;
    
    // Create the player
    player = new Player();

    

    // Create the monsters
    for (var i = 0; i < monsterNum; i++) {
        var randx = Math.floor(Math.random() * 451) + 100;
        var randy = Math.floor(Math.random() * 401) + 100;
        var location = new Point(randx, randy);
        createMonster(randx, randy);
        monster_location.push(location);
        monster_facing.push(true);
    }
    //create Boss
    var randx = Math.floor(Math.random() * 451) + 100;
    var randy = Math.floor(Math.random() * 401) + 100;
    var boss_location = new Point(randx, randy);
    createBoss(randx, randy);
    monster_location.push(boss_location);
    monster_facing.push(true);

    for (var i =0; i < 8; i++) {
        var randx = Math.floor(Math.random() * 451) + 100;
        var randy = Math.floor(Math.random() * 401) + 100;
        var location = new Point(randx, randy); 
        while (!burgerOnPlatform(location, BURGER_SIZE)) {
            var randx = Math.floor(Math.random() * 451) + 100;
            var randy = Math.floor(Math.random() * 401) + 100;
            location = new Point(randx, randy); 
        }
        createBurger(randx, randy);

        
    }
    createPortal(portalIn.x, portalIn.y);
    createPortal(portalOut.x, portalOut.y);

    //createExit(exit.x, exit.y);
    

    if (level == 1) {
        this.name = prompt("Please enter your name", this.name);
        if (this.name == "null" || this.name == "")   
        this.name = "Anonymous";
    }   
    bgm.play();
    bgm.loop = true;
    document.getElementById("name").appendChild(document.createTextNode(this.name));
    gameInterval = setInterval("gamePlay()", GAME_INTERVAL);
    timer = setInterval(function(){time_remaining -= 1;}, 1000);


    // Start the game interval
    //gameInterval = setInterval("gamePlay()", GAME_INTERVAL);

   
}

function createBurger(x, y) {

    var burger = document.createElementNS("http://www.w3.org/2000/svg", "use");
    document.getElementById("good_things").appendChild(burger);

    burger.setAttribute("x", x);
    burger.setAttribute("y", y);

    burger.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#good_thing");
}

function burgerOnPlatform(position, size) {

    var platforms = document.getElementById("platforms");

    for (var i = 0; i < platforms.childNodes.length; i++) {
        var node = platforms.childNodes.item(i);
        if (node.nodeName != "rect") continue;

        var x = parseFloat(node.getAttribute("x"));
        var y = parseFloat(node.getAttribute("y"));
        var w = parseFloat(node.getAttribute("width"));
        var h = parseFloat(node.getAttribute("height"));

        if (intersect(position, size, new Point(x, y), new Size(w, h)))
            return false;
    }

    return true;
}

function playerOnVerticalPlatform(position, motion, size) {

    var verticalPlatform = document.getElementById("verticalPlatform");

    var x = parseFloat(verticalPlatform.getAttribute("x"));
    var y = parseFloat(verticalPlatform.getAttribute("y"));
    var w = parseFloat(verticalPlatform.getAttribute("width"));
    var h = parseFloat(verticalPlatform.getAttribute("height"));

    return (((position.x + size.w > x && position.x < x + w) ||
         ((position.x + size.w) == x && motion == motionType.RIGHT) ||
         (position.x == (x + w) && motion == motionType.LEFT)) && 
         (position.y <= y - size.h + 2 && position.y >= y - 1.2 * size.h));
}

function moveVerticalPlatform() {

    var verticalPlatform = document.getElementById("verticalPlatform");

    if (parseInt(verticalPlatform.getAttribute("y")) <= 240)
        isUp = false;
    else if (parseInt(verticalPlatform.getAttribute("y")) >= 360)
        isUp = true;

    if (isUp)
        verticalPlatform.setAttribute("y", parseInt(verticalPlatform.getAttribute("y")) - VERTICAL_PLATFORM_SPEED);
    else 
        verticalPlatform.setAttribute("y", parseInt(verticalPlatform.getAttribute("y")) + VERTICAL_PLATFORM_SPEED);

}

function playerOnDisappearPlatform(position, motion, size) {
    
    for (var i = 1; i < 4; i++) {
        
        var disappearingPlatform = document.getElementById("disappearingPlatform" + i);

        if (disappearingPlatform == null)
            continue;

        var x = parseFloat(disappearingPlatform.getAttribute("x"));
        var y = parseFloat(disappearingPlatform.getAttribute("y"));
        var w = parseFloat(disappearingPlatform.getAttribute("width"));
        var h = parseFloat(disappearingPlatform.getAttribute("height"));

        if (((position.x + size.w > x && position.x < x + w) ||
             ((position.x + size.w) == x && motion == motionType.RIGHT) ||
             (position.x == (x + w) && motion == motionType.LEFT)) &&
            (position.y + size.h == y)) {
                disappearingPlatform.setAttribute("opacity", parseFloat(disappearingPlatform.getAttribute("opacity")) - 0.075);
        }
    }  

}


//
// This function creates the monsters in the game
//
function createMonster(x, y) {
    var monster = document.createElementNS("http://www.w3.org/2000/svg", "use");
    monster.setAttribute("x", x);
    monster.setAttribute("y", y);
    monster.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#monster");
    
    document.getElementById("monsters").appendChild(monster);
}

function createBoss(x, y) {

    var boss = document.createElementNS("http://www.w3.org/2000/svg", "use");
    boss.setAttribute("x", x);
    boss.setAttribute("y", y);   
    
    boss.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#boss");
    document.getElementById("monsters").appendChild(boss);
}

function moveMonsters() {

    var monster = document.getElementById("monsters");

    for (var i = 0; i < monster.childNodes.length; i++) {

        var node = monster.childNodes.item(i);

        if (parseInt(node.getAttribute("x")) == monster_location[i].x && parseInt(node.getAttribute("y")) == monster_location[i].y) {
            monster_location[i].x = Math.floor(Math.random() * 561);
            monster_location[i].y = Math.floor(Math.random() * 521);
        }

        if (parseInt(node.getAttribute("x")) < monster_location[i].x) {
            node.setAttribute("x", parseInt(node.getAttribute("x")) + monster_speed);
            node.setAttribute("transform", "scale(-1, 1) translate(-" + 2 * (parseInt(node.getAttribute("x")) + 20) + ",0)");
            monster_facing[i] = true;

        }
        else if (parseInt(node.getAttribute("x")) > monster_location[i].x) {
            node.setAttribute("x", parseInt(node.getAttribute("x")) - monster_speed);
            node.setAttribute("transform", "");
            monster_facing[i] = false;
        }

        if (parseInt(node.getAttribute("y")) < monster_location[i].y)
            node.setAttribute("y", parseInt(node.getAttribute("y")) + monster_speed);
        else if (parseInt(node.getAttribute("y")) > monster_location[i].y)
            node.setAttribute("y", parseInt(node.getAttribute("y")) - monster_speed);

        if (i == monster.childNodes.length - 1 && canBossShoot && isBossAlive)
            bossShoot(monster_facing[i], new Point(parseInt(node.getAttribute("x")), parseInt(node.getAttribute("y"))));

    }
}
function createPortal(x, y) {

    var portal = document.createElementNS("http://www.w3.org/2000/svg", "use");
    document.getElementById("portals").appendChild(portal);

    portal.setAttribute("x", x);
    portal.setAttribute("y", y);

    portal.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#portal"); 
}

function createExit(x, y) {

    var exit = document.createElementNS("http://www.w3.org/2000/svg", "use");
    document.getElementById("exit_loc").appendChild(exit);

    exit.setAttribute("x", x);
    exit.setAttribute("y", y);

    exit.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#exit");    
}


/*function goodThings(x, y) {
    var good_thing = document.createElementNS("http://www.w3.org/2000/svg", "use");
    good_thing.setAttribute("x", x);
    good_thing.setAttribute("y", y);
    good_thing.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#good_thing");
    document.getElementById("good_things").appendChild(good_thing);
}*/

function bossShoot(array, position) {

    canBossShoot = false;

    var bullet = document.createElementNS("http://www.w3.org/2000/svg", "use");
    document.getElementById("bullets").appendChild(bullet);

    if (array)
        bullet.setAttribute("stroke-width", 0);
    else 
        bullet.setAttribute("stroke-width", 1);

    bullet.setAttribute("stroke", "green");
    bullet.setAttribute("x", position.x + MONSTER_SIZE.w/2 - BULLET_SIZE.w/2);
    bullet.setAttribute("y", position.y + MONSTER_SIZE.h/2 - BULLET_SIZE.h/2);

    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#special_bullet");
}




//
// This function shoots a bullet from the player
//
function shootBullet() {
    // Disable shooting for a short period of time
    shoot.play();
    canShoot = false;
    bulletNum -= 1;
    document.getElementById("bulletNum").firstChild.data = bulletNum;
    setTimeout("canShoot = true", SHOOT_INTERVAL);

       // Create the bullet using the use node
    var bullet = document.createElementNS("http://www.w3.org/2000/svg", "use");
    document.getElementById("bullets").appendChild(bullet);
    if (player.facing == motionType.RIGHT)
        bullet.setAttribute("stroke-width", 0);
    else 
        bullet.setAttribute("stroke-width", 1);
    bullet.setAttribute("x", player.position.x + PLAYER_SIZE.w / 2 - BULLET_SIZE.w / 2);
    bullet.setAttribute("y", player.position.y + PLAYER_SIZE.h / 2 - BULLET_SIZE.h / 2);
    bullet.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", "#bullet");
    
}


//
// This is the keydown handling function for the SVG document
//
function keydown(evt) {
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();
    //var playerObject = document.getElementById("player");
    //var left = false;
    //var right = true;

    switch (keyCode) {
        case "A".charCodeAt(0): {
            player.motion = motionType.LEFT;
            player.facing = motionType.LEFT;
            break;
        }

        case "D".charCodeAt(0): {
            player.motion = motionType.RIGHT;
            player.facing = motionType.RIGHT;
            break;
        }
			
        case "W".charCodeAt(0):
            if (player.isOnPlatform()) {
                player.verticalSpeed = JUMP_SPEED;
            }
            break;

        case "H".charCodeAt(0):
            if (canShoot && bulletNum > 0) shootBullet();
            break;

        case "C".charCodeAt(0):
            clearHighScoreTable();
            alert("High score table cleared.");
            break;
    }
}


//
// This is the keyup handling function for the SVG document
//
function keyup(evt) {
    // Get the key code
    var keyCode = (evt.keyCode)? evt.keyCode : evt.getKeyCode();

    switch (keyCode) {
        case "A".charCodeAt(0):
            if (player.motion == motionType.LEFT) player.motion = motionType.NONE;
            break;

        case "D".charCodeAt(0):
            if (player.motion == motionType.RIGHT) player.motion = motionType.NONE;
            break;
    }
}


//
// This function checks collision
//
function collisionDetection() {
    // Check whether the player collides with a monster
    var monsters = document.getElementById("monsters");
    for (var i = 0; i < monsters.childNodes.length; i++) {
        var monster = monsters.childNodes.item(i);
        var x = parseInt(monster.getAttribute("x"));
        var y = parseInt(monster.getAttribute("y"));

        if (intersect(new Point(x, y), MONSTER_SIZE, player.position, PLAYER_SIZE)) {
            
            clearInterval(gameInterval);

            lose.play();
            gameOver();

            return; 
        } 
    }

    // Check whether a bullet hits a monster
    var bullets = document.getElementById("bullets");
    for (var i = 0; i < bullets.childNodes.length; i++) {

        var bullet = bullets.childNodes.item(i);
        var bullet_position = new Point(parseInt(bullet.getAttribute("x")), parseInt(bullet.getAttribute("y")));

        if (bullet.getAttribute("stroke") == "green" && intersect(bullet_position, BULLET_SIZE, player.position, PLAYER_SIZE)) {
            lose.play();
            gameOver();
            }
        
        if (bullet.getAttribute("stroke") == "green")
            continue;

        for (var j = 0; j < monsters.childNodes.length; j++) {

            var monster = monsters.childNodes.item(j);
            var monster_position = new Point(parseInt(monster.getAttribute("x")), parseInt(monster.getAttribute("y")));    

            if (intersect(bullet_position, BULLET_SIZE, monster_position, MONSTER_SIZE)) {
                
                kill.play();

                if (j == monsters.childNodes.length - 1)
                    isBossAlive = false;

                monsters.removeChild(monster);
                monster_location.splice(j, 1);
                monster_facing.splice(j, 1);
                bullets.removeChild(bullet);
                i--;
                j--;


                score += 10;
                document.getElementById("score").firstChild.data = score;
            }
        }
    }

    var burgers = document.getElementById("good_things");
    for (var i = 0; i < burgers.childNodes.length; i++) {

        var burger = burgers.childNodes.item(i);
        var burger_position = new Point(parseInt(burger.getAttribute("x")), parseInt(burger.getAttribute("y")));

        if (intersect(burger_position, BURGER_SIZE, player.position, PLAYER_SIZE)) {

            score += 20;
            document.getElementById("score").firstChild.data = score;

            burgers.removeChild(burger);
            i--;
        }
    }

    if (intersect(portalIn, PORTAL_SIZE, player.position, PLAYER_SIZE) && canTp) {
        canTp = false;
        player.position = portalOut;
        setTimeout("canTp = true", 1200);
    }

    if (intersect(portalOut, PORTAL_SIZE, player.position, PLAYER_SIZE) && canTp) {
        canTp = false;
        player.position = portalIn;
        setTimeout("canTp = true", 1200);
    }
    /*var exit = document.getElementById("exit_point");
    if (exit.childNodes.length > 0 && intersect(EXIT_POSITION, EXIT_SIZE, player.position, PLAYER_SIZE))
        nextLevel();*/

    var exitdd = document.getElementById("exit_loc");
    if (exitdd.childNodes.length > 0 && intersect(exit, EXIT_SIZE, player.position, PLAYER_SIZE) && level < 2)
        reset();
    
    if (exitdd.childNodes.length > 0 && intersect(exit, EXIT_SIZE, player.position, PLAYER_SIZE) && level == 2){
        win.play();
        score += 100 * (2);
        score += 1 * time_remaining;
        document.getElementById("score").firstChild.data = score;
        gameOver();
    }
        

    return;
}


//
// This function updates the position of the bullets
//
function moveBullets() {

    var bullet = document.getElementById("bullets");

    for (var i = 0; i < bullet.childNodes.length; i++) {

        var node = bullet.childNodes.item(i);
        
        if (parseInt(node.getAttribute("x")) + BULLET_SPEED > SCREEN_SIZE.w || parseInt(node.getAttribute("x")) - BULLET_SPEED < 0) {
            if (node.getAttribute("stroke") == "green" && isBossAlive)
                canBossShoot = true;
            bullet.removeChild(node);
            i--;
        }
        else 
            if (node.getAttribute("stroke-width") == 0)
                node.setAttribute("x", parseInt(node.getAttribute("x")) + BULLET_SPEED);
            else 
                node.setAttribute("x", parseInt(node.getAttribute("x")) - BULLET_SPEED);
    }
}


//
// This function updates the position and motion of the player in the system
//
function gamePlay() {
    // Check collisions
    collisionDetection();
    document.getElementById("time_remaining").firstChild.data = time_remaining;
    if (time_remaining <= 0) {
        lose.play();
        gameOver();
    }
        

    var burgers = document.getElementById("good_things");
    if (burgers.childNodes.length == 0 && document.getElementById("exit_loc").childNodes.length == 0){
        createExit(exit.x, exit.y);
    }

    // Check whether the player is on a platform
    var isOnPlatform = player.isOnPlatform();
    
    // Update player position
    var displacement = new Point();

    // Move left or right
    if (player.motion == motionType.LEFT)
        displacement.x = -MOVE_DISPLACEMENT;
    if (player.motion == motionType.RIGHT)
        displacement.x = MOVE_DISPLACEMENT;

    // Fall
    if (!isOnPlatform && player.verticalSpeed <= 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
    }

    // Jump
    if (player.verticalSpeed > 0) {
        displacement.y = -player.verticalSpeed;
        player.verticalSpeed -= VERTICAL_DISPLACEMENT;
        if (player.verticalSpeed <= 0)
            player.verticalSpeed = 0;
    }

    // Get the new position of the player
    var position = new Point();
    position.x = player.position.x + displacement.x;
    position.y = player.position.y + displacement.y;

    // Check collision with platforms and screen
    player.collidePlatform(position);
    player.collideScreen(position);

    // Set the location back to the player object (before update the screen)
    player.position = position;

    // Move the bullets
    moveBullets();
    moveMonsters();
    moveVerticalPlatform();
    playerOnDisappearPlatform(player.position, player.motion, PLAYER_SIZE);

    updateScreen();
}


//
// This function updates the position of the player's SVG object and
// set the appropriate translation of the game screen relative to the
// the position of the player
//
function updateScreen() {
    // Transform the player
    player.node.setAttribute("transform", "translate(" + player.position.x + "," + player.position.y + ")");

    if (player.facing == motionType.RIGHT) {
        document.getElementById("player_body").setAttribute("transform", "");
    }
    else {
        document.getElementById("player_body").setAttribute("transform", "scale(-1, 1) translate(-" + PLAYER_SIZE.w + ",0)");
    }
    // Calculate the scaling and translation factors	
    
    // Add your code here
	
}


/*function verticalPlatform() {
    var y = parseInt(verticalPlatform.getAttribute("y"));
    if(isMoving) {
        if(y > 200)
            verticalPlatform.setAttribute("y", y - 1);
        else
            isMoving = false;
    }
    else {
        if (y < 380)
            verticalPlatform.setAttribute("y", y + 1);
        else
            isMoving = true;
    }
}*/
function gameOver() {

    
    bgm.pause();

    clearInterval(gameInterval);
    clearInterval(timer);
    document.removeEventListener("keydown", keydown, false);
    document.removeEventListener("keyup", keyup, false);

    var table = getHighScoreTable();
    var record = new ScoreRecord(this.name, parseInt(this.score));
    var added = false;

    for (var i = 0; i < table.length; i++) {
        if (table[i].score < record.score) {
            table.splice(i, 0, record);
            added = true;
            break;
        }
    }

    if (table.length < 5 && !added)
        table.splice(table.length, 0, record);

    setHighScoreTable(table);
    showHighScoreTable(table, this.name, this.score);

    level = 0;
    score = 0;
    document.getElementById("score").firstChild.data = score;
    added_current_name = false;
    added_current_score = false;

    return;

}

var HIGH_SCORE_NUM = 5;             // The number of highest score to show
var added_current_name = false;     // Mark whether the current player name is added to the table or not
var added_current_score = false;     // Mark whether the current player score is added to the table or not

//
// A score record JavaScript class to store the name and the score of a player
//
function ScoreRecord(name, score) {
    this.name = name;
    this.score = score;
}


//
// This function reads the high score table from the cookies
//
function getHighScoreTable() {
    var table = new Array();

    for (var i = 0; i < HIGH_SCORE_NUM; i++) {
        
        // Contruct the cookie name
        // Get the cookie value using the cookie name
        var cookie = getCookie("player" + i);

        // If the cookie does not exist exit from the for loop
        // Extract the name and score of the player from the cookie value
        if (cookie == null)
            break;
        else
            var record = cookie.split("~");

        // Add a new score record at the end of the array
        table.push(new ScoreRecord(record[0], parseInt(record[1])));
    }

    return table;
}

    
//
// This function stores the high score table to the cookies
//
function setHighScoreTable(table) {
    for (var i = 0; i < HIGH_SCORE_NUM; i++) {
        // If i is more than the length of the high score table exit
        // from the for loop
        if (i >= table.length) 
            break;

        // Contruct the cookie name
        // Store the ith record as a cookie using the cookie name
        setCookie("player" + i, table[i].name + "~" + table[i].score);
    }
}
  
//
// Clear the high score table, delete all the cookies
//
function clearHighScoreTable() {
    var highScoreTable = getHighScoreTable();
    for (var i = 0; i < highScoreTable.length; i++) {
        var name = "player" + i;
        deleteCookie(name);
    }
}

//
// This function adds a high score entry to the text node
//
function addHighScore(record, node, player_name, player_score) {

    // Create the name text span
    var name = document.createElementNS("http://www.w3.org/2000/svg", "tspan");

    // Set the attributes and create the text
    name.setAttribute("x", 100);
    name.setAttribute("dy", 40);
    if (record.name == player_name && record.score == player_score && !added_current_name) {
        name.style.setProperty("fill", "red", null);
        added_current_name = true;
    }
    name.appendChild(document.createTextNode(record.name));

    // Add the name to the text node
    node.appendChild(name);

    // Create the score text span
    var score = document.createElementNS("http://www.w3.org/2000/svg", "tspan");

    // Set the attributes and create the text
    score.setAttribute("x", 400);
    if (record.name == player_name && record.score == player_score && !added_current_score) {
        score.style.setProperty("fill", "red", null);
        added_current_score = true;
    }
    score.appendChild(document.createTextNode(record.score));

    // Add the score to the text node
    node.appendChild(score);
}

    
//
// This function shows the high score table to SVG 
//
function showHighScoreTable(table, name, score) {
    // Show the table
    var node = document.getElementById("highscoretable");
    node.style.setProperty("visibility", "visible", null);

    // Get the high score text node
    var node = document.getElementById("highscoretext");
    
    for (var i = 0; i < HIGH_SCORE_NUM; i++) {
        // If i is more than the length of the high score table exit
        // from the for loop
        if (i >= table.length) break;

        // Add the record at the end of the text node
        addHighScore(table[i], node, name, score);
    }
}


// Reset the high score tabel
function resetHighScoreTable() {

    var node = document.getElementById("highscoretext");
    while (node.childNodes.length > 0)
        node.lastChild.remove();

}


//
// The following functions are used to handle HTML cookies
//

//
// Set a cookie
//
function setCookie(name, value, expires, path, domain, secure) {
    var curCookie = name + "=" + escape(value) +
        ((expires) ? "; expires=" + expires.toGMTString() : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        ((secure) ? "; secure" : "");
    document.cookie = curCookie;
}


//
// Get a cookie
//
function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    } else
        begin += 2;
    var end = document.cookie.indexOf(";", begin);
    if (end == -1)
        end = dc.length;
    return unescape(dc.substring(begin + prefix.length, end));
}


//
// Delete a cookie
//
function deleteCookie(name, path, domain) {
    if (get_cookie(name)) {
        document.cookie = name + "=" + 
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "") +
        "; expires=Thu, 01-Jan-70 00:00:01 GMT";
    }
}

function reset() {

    

    if (level != 0)
        win.play();

    // Clear all the intervals
    clearInterval(gameInterval);
    clearInterval(timer);
    document.removeEventListener("keydown", keydown, false);
    document.removeEventListener("keyup", keyup, false);

    // Reset all svg objects
    var monsters = document.getElementById("monsters");
    while (monsters.childNodes.length > 0)
        monsters.removeChild(monsters.childNodes.item(0));
    
    var bullets = document.getElementById("bullets");
    while (bullets.childNodes.length > 0)
        bullets.removeChild(bullets.childNodes.item(0));

    var burgers = document.getElementById("good_things");
    while (burgers.childNodes.length > 0)
        burgers.removeChild(burgers.childNodes.item(0));
    
    if (document.getElementById("exit_loc").childNodes.length != 0)
        document.getElementById("exit_loc").removeChild(document.getElementById("exit_loc").childNodes.item(0));

    // Handle level proceed
    level += 1;
    document.getElementById("level").firstChild.data = level;

    // Update score
    if (level != 1) {
        score += 100 * (1);
        score += 1 * time_remaining;
        document.getElementById("score").firstChild.data = score;
    }

    // Reset all variables
    player.position = PLAYER_INIT_POS;
    document.getElementById("name").removeChild(document.getElementById("name").childNodes.item(0));
    
    canShoot = true;
    bulletNum = 8;
    document.getElementById("bulletNum").firstChild.data = bulletNum;
    isUp = true;
    monsterNum = 5 + 4 * (level - 1);
    monster_location = new Array();
    monster_facing = new Array();
    canBossShoot = true;
    isBossAlive = true;
    time_remaining = TIME_ALLOWED;
    document.getElementById("time_remaining").firstChild.data = time_remaining;
    
    
    gameInterval = null;
    timer = null;
    
    for (var i = 1; i < 4; i++) {
        document.getElementById("disappearingPlatform" + i).setAttribute("opacity", 1);
    }
    
    
        
   
    
    // reload the setting with reset variables
    load();

    return;
}