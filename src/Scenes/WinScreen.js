class WinScreen extends Phaser.Scene {
  constructor() {
    super('winner');
  }

  preload() {
    this.load.setPath("./assets/");
    // Load the font
    this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");
  }

  create(data) {
        // Game name
        this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY - 50, "rocketSquare", "VICTORY!", 32)
            .setOrigin(0.5);

        // Controls
        this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY, "rocketSquare", `Score: ${data.score}`, 24)
            .setOrigin(0.5);

        // Start
        this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY + 50, "rocketSquare", "REPLAY", 24)
            .setOrigin(0.5)
            .setInteractive()
            .on("pointerdown", () => {
                this.scene.start("startGame"); // Restart the gameplay scene
            });
    }
}