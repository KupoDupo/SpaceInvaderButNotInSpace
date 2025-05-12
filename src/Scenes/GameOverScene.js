class GameOverScene extends Phaser.Scene {
  constructor() {
    super('gameOver');
  }

  create(data) {
        // Display "Game Over" text
        this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY - 50, "rocketSquare", "GAME OVER", 32)
            .setOrigin(0.5);

        // Display the player's score
        this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY, "rocketSquare", `Score: ${data.score}`, 24)
            .setOrigin(0.5);

        // Add a restart button
        this.add.bitmapText(this.cameras.main.centerX, this.cameras.main.centerY + 50, "rocketSquare", "RESTART", 24)
            .setOrigin(0.5)
            .setInteractive()
            .on("pointerdown", () => {
                this.scene.start("startGame"); // Restart the gameplay scene
            });
    }
}