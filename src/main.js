// Loisel Kleijnen
// Created: 4/28/2025
// Phaser: 3.70.0
//
// Plane Invaders?
//
// Art assets from Kenny Assets:
// https://kenney.nl/assets/

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    fps: { forceSetTimeOut: true, target: 60 },   // ensure consistent timing across machines
    width: 800,
    height: 600,
    scene: [StartScreen, PlanesFight, GameOverScene]
}


const game = new Phaser.Game(config);