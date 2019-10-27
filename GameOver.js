"use strict";

//Global Variables
var endText;

var GameOver = function(game) {
};

GameOver.prototype = {
	init:function() {

	},
	//preloads all assests (images, sound, etc.) needed for the game
	preload:function() {

	},
	create:function() {

		this.background = game.add.sprite(0, 0, 'background');
		//var styles = { font: "bold 32px Arial", fill: "#000000", boundsAlignH: "center", boundsAlignV: "middle" };
		endText = game.add.text(400, 300, "Game Over!");
		endText.anchor.setTo(0.5,0,5);
	},
	update:function() {
	
	},

	render:function() {

	}
}

