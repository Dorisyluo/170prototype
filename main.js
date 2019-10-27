var game = new Phaser.Game(800, 600, Phaser.AUTO, 'Game');

game.state.add('Play', Play);
game.state.add('GameOver', GameOver);
game.state.start('Play');

// function preload() {

// }

// function create() {

// 	game.stage.backgroundColor = 'rgb(90,90,90)';
// }

// function update() {

// }