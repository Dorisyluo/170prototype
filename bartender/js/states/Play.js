"use strict";

//global arrays to keep track of type identifications
var bulletArray = ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'];
var customerArray = [null , null, null, null, null];

//flags for keystrokes so they only register once while being held
var reloadFlag = false;

var Play = function(game) {
};

Play.prototype = {
	init:function() {
		//NOTE: add hologram later
		this.customerTypes = ['bulletman', 'drinkman', 'shotman'];
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

		//loads up and display initial bullets
		reload(this.barrel);

		//loads up timer for customers
    	this.customerTimer = game.time.create(false);
		this.customerTimer.loop(Phaser.Timer.SECOND * 2, arrival, this);
		this.customerTimer.start();
	},
	update:function() {

		//checks for reload---------------------------------
		//MAPPING: 'R' key
		if(game.input.keyboard.isDown(Phaser.Keyboard.R)) {
			if (!reloadFlag) {
				reload(this.barrel);
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
		//-------------------checks for rolling the revolver
	},
	render:function() {
		//for debugging purposes, add code here
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
			var person = game.add.sprite(70 + (135 * seats[x]), 220, customerArray[seats[x]]);
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
		barrel[x] = game.add.sprite(550 + (40 * x), 500, bulletArray[x]);
	}
}

//listens for shots fired
function serveListener(game, customers, barrel, index) {
	//correct shot was made
	if (bulletArray[0] + 'man' == customerArray[index]) {
		this.customers[index].destroy();
		this.customers[index] = null;
		this.barrel[0].destroy();
		this.barrel[0] = this.game.add.sprite(550, 500, 'empty');
		bulletArray[0] = 'empty';
		customerArray[index] = null;
	}
}