class PlanesFight extends Phaser.Scene {

    constructor() {
        super("planesFight");

        this.my = {sprite: {}, text: {}};

        this.my.sprite.bullet = [];   
        this.maxBullets = 20;           // Don't create more than this many bullets
        
        this.my.sprite.enemy_bullet = []; 
        this.maxEnemyBullets = 20;

        this.myScore = 0;       // record a score as a class variable
        // More typically want to use a global variable for score to use across multiple Scenes but okay here
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("player", "player_ship.png");
        this.load.image("pbullet", "player_bullet.png");
        this.load.image("s_enemy", "small_enemy.png");
        this.load.image("m_enbullet", "enemy_small_bullet.png");
        this.load.image("m_enemy", "medenemy.png");
        this.load.image("health", "health.png");

        // For animation
        this.load.image("whitePuff00", "whitePuff00.png");
        this.load.image("whitePuff01", "whitePuff01.png");
        this.load.image("whitePuff02", "whitePuff02.png");
        this.load.image("whitePuff03", "whitePuff03.png");

        // Load the Kenny Rocket Square bitmap font
        // This was converted from TrueType format into Phaser bitmap
        // format using the BMFont tool.
        // BMFont: https://www.angelcode.com/products/bmfont/
        // Tutorial: https://dev.to/omar4ur/how-to-create-bitmap-fonts-for-phaser-js-with-bmfont-2ndc
        this.load.bitmapFont("rocketSquare", "KennyRocketSquare_0.png", "KennyRocketSquare.fnt");

        // Sound asset from the Kenny Music Jingles pack
        // https://kenney.nl/assets/music-jingles
        this.load.audio("smallping", "impactMining_000.ogg");
        this.load.audio("damage", "impactPlate_heavy_000.ogg");
    }

    // Helper Function to Create Pyramid of Small Enemies
    spawnEnemyPyramid(startX = game.config.width/2) {
        let my = this.my;
        let startY = 50; // Starting Y position for the pyramid
        let spacing = 40; // Spacing between ships
    
        my.sprite.enemies = []; // Array to store enemy ships
    
        // Create the pyramid (3 rows: 1, 2, 3 ships)
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col <= row; col++) {
                let x = startX - (row * spacing / 2) + (col * spacing);
                let y = startY + (row * spacing);
                let enemy = this.add.sprite(x, y, "s_enemy");
                enemy.setScale(1.0); // Experimenting with size for best look
                enemy.setFlipY(true); // Flip the enemy sprite so it faces player
                enemy.scorePoints = 25;
                my.sprite.enemies.push(enemy);
            }
        }
    }

    // Helper Function to Check if All Enemies are Defeated (for respawn and game over)
    areAllEnemiesDefeated() {
        return this.my.sprite.enemies.every(enemy => !enemy.visible);
    }

    fireMediumEnemyBullet(x, y) {
        let enemy_bullet = this.add.sprite(x, y, "m_enbullet");
        enemy_bullet.setScale(1.0);
        enemy_bullet.speed = 2;
        this.my.sprite.enemy_bullet.push(enemy_bullet);
    }

    create() {
        let my = this.my;

        my.sprite.player = this.add.sprite(game.config.width/2, game.config.height - 40, "player");
        my.sprite.player.setScale(2.0);

        this.spawnEnemyPyramid();

        my.sprite.medium_enemy = this.add.sprite(game.config.width/2, 80, "m_enemy");
        my.sprite.medium_enemy.scorePoints = 50;
        my.sprite.medium_enemy.setScale(2.0);
        my.sprite.medium_enemy.setFlipY(true);
        my.sprite.medium_enemy.direction = 1;
        my.sprite.medium_enemy.speed = 1;
        my.sprite.medium_enemy.lastFired = 0;

        // I know I probably could've done the set path stuff we went over but this seemed more precise
        this.time.addEvent({
            delay: 2000, // 2 seconds, 1000 = 1 second, measured in ms (convert to s for human eyes lol)
            callback: () => {
                my.sprite.medium_enemy.direction *= -1;
            },
            loop: true // Loops the event (repeat)
        });

        // Creating Array to Hold Player Health - 3 Lives System
        my.sprite.health = [];
        for (let i = 0; i < 3; i++) {
            let healthSprite = this.add.sprite(20 + i * 30, 15, "health");
            healthSprite.setScale(2.0);
            my.sprite.health.push(healthSprite);
        }
        // Create white puff animation
        this.anims.create({
            key: "puff",
            frames: [
                { key: "whitePuff00" },
                { key: "whitePuff01" },
                { key: "whitePuff02" },
                { key: "whitePuff03" },
            ],
            frameRate: 20,
            repeat: 5,
            hideOnComplete: true
        });

        // Create key objects
        this.left = this.input.keyboard.addKey("A");
        this.right = this.input.keyboard.addKey("D");
        //this.nextScene = this.input.keyboard.addKey("S");
        this.space = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Set movement speeds (in pixels/tick)
        this.playerSpeed = 5;
        this.bulletSpeed = 5;

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>Planes Invader.js</h2><br>A: left // D: right // Space: fire/emit'
        // Put score on screen
        my.text.score = this.add.bitmapText(580, 0, "rocketSquare", "Score " + this.myScore);

    }

    update() {
        let my = this.my;

        // Move enemy bullets downward
        for (let bullet of my.sprite.enemy_bullet) {
            bullet.y += bullet.speed; // Move the bullet downward

            // Destroy the bullet if it goes off-screen
            if (bullet.y > game.config.height) {
                bullet.destroy();
            }

            // Check for collision with the player
            if (this.collides(my.sprite.player, bullet)) {
                bullet.y = -100; // Destroy the bullet

                // Remove one health sprite
                if (my.sprite.health.length > 0) {
                    let lostHealth = my.sprite.health.pop(); // Remove the last health sprite
                    lostHealth.destroy(); // Destroy the sprite
                    this.sound.play("damage", {
                        volume: 1 // Play damage sound
                    });
                }

                // Check if the player has no health left
                if (my.sprite.health.length === 0) {
                    this.gameOver(); // Call game over logic
                }
            }
        }

        my.sprite.enemy_bullet = my.sprite.enemy_bullet.filter((enemy_bullet) => enemy_bullet.y > -(enemy_bullet.displayHeight/2));

        if (my.sprite.medium_enemy.visible) {
            my.sprite.medium_enemy.x += my.sprite.medium_enemy.direction * my.sprite.medium_enemy.speed;

            // Boundary Checking for Medium Enemy
            if (my.sprite.medium_enemy.x <= my.sprite.medium_enemy.displayWidth / 2) {
                my.sprite.medium_enemy.x = my.sprite.medium_enemy.displayWidth / 2;
                my.sprite.medium_enemy.direction = 1; // Force direction to right
            }
            if (my.sprite.medium_enemy.x >= game.config.width - my.sprite.medium_enemy.displayWidth / 2) {
                my.sprite.medium_enemy.x = game.config.width - my.sprite.medium_enemy.displayWidth / 2;
                my.sprite.medium_enemy.direction = -1; // Force direction to left
            }

            let currentTime = this.time.now;
            if (currentTime - my.sprite.medium_enemy.lastFired > 1000) {
                this.fireMediumEnemyBullet(my.sprite.medium_enemy.x, my.sprite.medium_enemy.y);
                my.sprite.medium_enemy.lastFired = currentTime;
            }
        }

        // Move small enemy pyramid forward
        for (let enemy of my.sprite.enemies) {
            if (enemy.visible) {
                enemy.y += 1; // Adjust the speed as needed

                if (enemy.y > game.config.height) {
                    enemy.visible = false;
                    enemy.destroy(); 

                    if (my.sprite.health.length > 0) {
                        let lostHealth = my.sprite.health.pop();
                        this.sound.play("damage", {
                            volume: 1   // Can adjust volume using this, goes from 0 to 1
                        });
                        lostHealth.destroy();
                    }

                    if (my.sprite.health.length === 0) {
                        this.gameOver();
                    }
                }
            }
        }


        // Moving left
        if (this.left.isDown) {
            // Check to make sure the sprite can actually move left
            if (my.sprite.player.x > (my.sprite.player.displayWidth/2)) {
                my.sprite.player.x -= this.playerSpeed;
            }
        }

        // Moving right
        if (this.right.isDown) {
            // Check to make sure the sprite can actually move right
            if (my.sprite.player.x < (game.config.width - (my.sprite.player.displayWidth/2))) {
                my.sprite.player.x += this.playerSpeed;
            }
        }

        // Check for bullet being fired
        if (Phaser.Input.Keyboard.JustDown(this.space)) {
            // Are we under our bullet quota?
            if (my.sprite.bullet.length < this.maxBullets) {
                my.sprite.bullet.push(this.add.sprite(
                    my.sprite.player.x, my.sprite.player.y-(my.sprite.player.displayHeight/2), "pbullet")
                );
            }
        }

        my.sprite.bullet = my.sprite.bullet.filter((bullet) => bullet.y > -(bullet.displayHeight/2));

        // Check for collision
        for (let bullet of my.sprite.bullet) {
            for (let enemy of my.sprite.enemies) {
                if (this.collides(enemy, bullet)) {
                    // start animation
                    this.puff = this.add.sprite(enemy.x, enemy.y, "whitePuff03").setScale(0.25).play("puff");
                    // clear out bullet -- put y offscreen, will get reaped next update
                    bullet.y = -100;
                    enemy.visible = false;
                    enemy.x = -100;
                    // Update score
                    this.myScore += enemy.scorePoints;
                    this.updateScore();
                    // Play sound
                    this.sound.play("smallping", {
                        volume: 1   // Can adjust volume using this, goes from 0 to 1
                    });
                    // this.puff.on(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
                        // enemy.visible = true;
                        // enemy.x = Math.random()*config.width;
                    // }, this);
                }
            }
        }

        // Make all of the bullets move
        for (let bullet of my.sprite.bullet) {
            bullet.y -= this.bulletSpeed;
        }

        if (this.areAllEnemiesDefeated()) {
            let newX = Phaser.Math.Between(50, 150); // Random X start
            this.spawnEnemyPyramid(newX);
        }

    }

    // A center-radius AABB collision check
    collides(a, b) {
        if (Math.abs(a.x - b.x) > (a.displayWidth/2 + b.displayWidth/2)) return false;
        if (Math.abs(a.y - b.y) > (a.displayHeight/2 + b.displayHeight/2)) return false;
        return true;
    }

    updateScore() {
        let my = this.my;
        my.text.score.setText("Score " + this.myScore);
    }

    gameOver() {
        this.scene.restart();
    }

}
         