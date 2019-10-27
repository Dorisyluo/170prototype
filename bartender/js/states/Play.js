"use strict";

//global arrays to keep track of type identifications
var bulletArray = ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'];
var customerArray = [null , null, null, null, null];
var score = 0;
var scoreText;

//flags for keystrokes so they only register once while being held
var reloadFlag = false;
//flag for cooldown timer
var canReload = true;
//flag for emp cooldown timer
var canEmp = true;

var Play = function(game) {
};

Play.prototype = {
	init:function() {
		//NOTE: add hologram later
		this.customerTypes = ['bulletman', 'drinkman', 'shotman', 'holoman'];
		this.barrel = Phaser.ArrayUtils.numberArray(0, 5);
		this.customers = Phaser.ArrayUtils.numberArray(0, 4);
		for (var x = 0; x < 5; x++) {
			this.customers[x] = null;
		}

		this.order = game.add.group();
	},
	//preloads all assests (images, sound, etc.) needed for the game
	preload:function() {
		game.load.image('background', 'assets/img/background.png');
		game.load.image('barcounter', 'assets/img/barcounter.png');

		//bullet types; kept as separate assets instead of an atlas for convenience
		//NOTE: if not convenient at all, please notify one of the programmers to change it to an atlas
		game.load.image('bullet', 'assets/img/bullet.png');
		game.load.image('drink', 'assets/img/drink.png');
		game.load.image('shot', 'assets/img/shot.png');
		game.load.image('empty', 'assets/img/empty.png');
		game.load.image('emp', 'assets/img/emp.png');

		//customer types; kept as separate assets instead of an atlas for convenience
		//NOTE: if not convenient at all, please notify one of the programmers to change it to an atlas
		game.load.image('bulletman', 'assets/img/bulletman.png');
		game.load.image('drinkman', 'assets/img/drinkman.png');
		game.load.image('shotman', 'assets/img/shotman.png');
		game.load.image('holoman', 'assets/img/holoman.png');
	},
	create:function() {
		//creates ARCADE physics system in case if it is needed; REMOVE if not required
		game.physics.startSystem(Phaser.Physics.ARCADE);

		//readies mouse input listener
		game.input.mouse.capture = true;

		//draws the bar/saloon
		this.background = game.add.sprite(0, 0, 'background');
		this.barcounter = game.add.sprite(0, 400, 'barcounter');

		//creates emp button and listener
		this.emp = game.add.sprite(50, 450, 'emp');
		this.emp.inputEnabled = true;
		this.emp.events.onInputDown.add(empListener, this, this.customers);

		//loads up and display initial bullets
		reload(this.barrel);

		//loads up timer for customers
    	this.customerTimer = game.time.create(false);
		this.customerTimer.loop(Phaser.Timer.SECOND * 2, arrival, this);
		this.customerTimer.start();

		//indicator for current bullet
		this.currentBullet = new Phaser.Rectangle(550, 400, 30, 75)

		//Score Text
		scoreText = game.add.text(25, 25, "Score: $0");

	},
	update:function() {

		//checks for reload---------------------------------
		//MAPPING: 'R' key
		if(game.input.keyboard.isDown(Phaser.Keyboard.R)) {
			if (!reloadFlag && canReload) {
				reload(this.barrel);
				//cooldown timer for reloading
				this.time.events.add(Phaser.Timer.SECOND * 5, reloadCooldown, this);
				canReload = false;
			    
			}
			reloadFlag = true;
		}
		else {
			reloadFlag = false;
		}
		//---------------------------------checks for reload

		//checks for rolling the revolver-------------------
		//MAPPING: Scroll wheel

		//scrolls bullets left
		if (game.input.mouse.wheelDelta == -1) {
			console.log('down');
			var temp = this.barrel[0];
			var temp2 = bulletArray[0];
			for (var x = 0; x < 5; x++) {
				this.barrel[x] = this.barrel[x + 1];
				this.barrel[x].x -= 40;
				bulletArray[x] = bulletArray[x + 1];
			}
			this.barrel[5] = temp;
			bulletArray[5] = temp2;
			this.barrel[5].x += 40 * 5;

			game.input.mouse.wheelDelta = 0;
		}

		//scrolls bullets right
		else if (game.input.mouse.wheelDelta == 1) {
			console.log('up');
			var temp = this.barrel[5];
			var temp2 = bulletArray[5];
			for (var x = 5; x > 0; x--) {
				this.barrel[x] = this.barrel[x - 1];
				this.barrel[x].x += 40;
				bulletArray[x] = bulletArray[x - 1];
			}
			this.barrel[0] = temp;
			bulletArray[0] = temp2;
			this.barrel[0].x -= 40 * 5;

			game.input.mouse.wheelDelta = 0;
		}

		//makeshift cooldown indicator for emp
		if (!canEmp) {
			this.emp.tint = 0xff0000;
		}
		else {
			this.emp.tint = 0xffffff;
		}

		//brings respective assets in front of spawned customers
		game.world.bringToTop(this.barcounter);
		for (var x = 0; x < 6; x ++) {
			game.world.bringToTop(this.barrel[x]);
		}
		game.world.bringToTop(this.emp);

		//-------------------checks for rolling the revolver
	},

	//display inidcator for current bullet
	render:function() {
		//for debugging purposes, add code here
		game.debug.geom(this.currentBullet,"#ff00ff",false);
	}
}

//handles the arrival of customers
function arrival () {

	//randomizes the seat order to check in so that it isn't just the leftmost open seat that is being filled
	var seats = [0, 1, 2, 3, 4];
	seats = Phaser.ArrayUtils.shuffle(seats);

	//checks for vacant seats and puts a new customer there upon finding one
	for (var x = 0; x < 5; x++) {
		if (this.customers[seats[x]] == null) {
			customerArray[seats[x]] = Phaser.ArrayUtils.getRandomItem(this.customerTypes);
			var person = game.add.sprite(70 + (135 * seats[x]), 225, customerArray[seats[x]]);
			this.customers[seats[x]] = person;
			person.inputEnabled = true;
			person.events.onInputDown.add(serveListener, this, this.customers, this.barrel, seats[x]);
			break;
		}
	}	
}

//reloads the entirety of the revolver
function reload(barrel) {
	var bulletTypes = ['bullet', 'drink', 'shot'];
	for (var x = 0; x < 6; x++) {
		bulletArray[x] = Phaser.ArrayUtils.getRandomItem(bulletTypes);
		barrel[x] = game.add.sprite(550 + (40 * x), 400, bulletArray[x]);
	}
}

//listens for shots fired
function serveListener(game, customers, barrel, index) {
	//correct shot was made
	if (bulletArray[0] + 'man' == customerArray[index]) {
		this.customers[index].destroy();
		this.customers[index] = null;
		this.barrel[0].destroy();
		this.barrel[0] = this.game.add.sprite(550, 400, 'empty');
		bulletArray[0] = 'empty';
		customerArray[index] = null;
		score += 50;
		scoreText.setText('Score: $' + score);
	}
}

//listens for emp button press
function empListener(game, customers) {
	if (canEmp) {
		for (var x = 0; x < 5; x++) {
			if (customerArray[x] == 'holoman') {
				customerArray[x] = null;
				this.customers[x].destroy();
				this.customers[x] = null;
			}
		}
		canEmp = false;
		this.time.events.add(Phaser.Timer.SECOND * 20, empCooldown, this);
	}
}

//function for reload cooldown timer
function reloadCooldown(){
	canReload = true;
}

//function for emp cooldown timer
function empCooldown() {
	canEmp = true;
}