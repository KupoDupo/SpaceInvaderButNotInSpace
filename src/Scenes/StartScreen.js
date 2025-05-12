class StartScreen extends Phaser.Scene {
  constructor() {
    super('startGame');
  }

  preload() {
    this.load.setPath("./assets/");
    // Load the font
    this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
  }

  create() {
        // Game name
        this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY - 50, "rocketSquare", "PLANE DEFENDER", 32)
            .setOrigin(0.5);

        // Controls
        this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY, "rocketSquare", "PRESS A AND D TO MOVE LEFT AND RIGHT, SPACE BAR TO FIRE", 20)
            .setOrigin(0.5);

        // Start
        this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY + 50, "rocketSquare", "START", 24)
            .setOrigin(0.5)
            .setInteractive()
            .on("pointerdown", () => {
                this.scene.start("planesFight"); // Restart the gameplay scene
            });
    }
}