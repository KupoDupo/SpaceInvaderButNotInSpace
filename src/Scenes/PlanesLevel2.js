class PlanesLevel2 extends Phaser.Scene {

    constructor() {
        super("level2");

        this.my = {sprite: {}, text: {}};
   
        this.maxBullets = 20;           // Don't create more than this many bullets
        
        this.maxEnemyBullets = 20;

        this.myScore = 700;       // score from last level - should probably store/pass this but if it works it works
    }

    preload() {
        this.load.setPath("./assets/");
        this.load.image("player", "player_ship.png");
        this.load.image("pbullet", "player_bullet.png");
        this.load.image("s_enemy", "small_enemy.png");
        this.load.image("m_enbullet", "enemy_small_bullet.png");
        this.load.image("m_enemy", "medenemy.png");
        this.load.image("health", "health.png");
        this.load.image("large", "large_ship.png");
        this.load.image("large_bullet", "largebullet.png");

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
    areAllSmallEnemiesDefeated() {
        return this.my.sprite.enemies.every(enemy => !enemy.visible);
    }

    // Helper Function for Enemy Fire Rate
    fireMediumEnemyBullet(x, y) {
        let enemy_bullet = this.add.sprite(x, y, "m_enbullet");
        enemy_bullet.setScale(1.0);
        enemy_bullet.speed = 1.5;
        this.my.sprite.enemy_bullet.push(enemy_bullet);
    }

    fireLargeEnemyBullet(x, y) {
        let large_bullet = this.add.sprite(x, y, "large_bullet");
        large_bullet.setScale(1.5);
        large_bullet.speed = 1.5;
        this.my.sprite.enemy_bullet.push(large_bullet);
    }

    create() {
        let my = this.my;

        //Initializing Arrays
        this.my.sprite.enemy_bullet = []; 
        this.my.sprite.bullet = []; 
        my.sprite.enemies = [];

        //player firing rate 
        this.bulletFired = 0;
        this.fireRate = 350; // upgrading firing rate for next levels

        my.sprite.player = this.add.sprite(game.config.width/2, game.config.height - 40, "player");
        my.sprite.player.setScale(2.0);

        this.spawnEnemyPyramid();

        my.sprite.medium_enemy = this.add.sprite(game.config.width/3, 80, "m_enemy");
        my.sprite.medium_enemy.scorePoints = 50;
        my.sprite.medium_enemy.setScale(2.0);
        my.sprite.medium_enemy.setFlipY(true);
        my.sprite.medium_enemy.direction = 1;
        my.sprite.medium_enemy.speed = 1;
        my.sprite.medium_enemy.lastFired = 0;
        my.sprite.medium_enemy.health = 3;

        // large enemy stuffs
        my.sprite.large_enemy = this.add.sprite(3 * game.config.width/4, 80, "large");
        my.sprite.large_enemy.scorePoints = 100;
        my.sprite.large_enemy.setScale(2.5);
        my.sprite.large_enemy.setFlipY(true);
        my.sprite.large_enemy.direction = 1;
        my.sprite.large_enemy.speed = 0.3;
        my.sprite.large_enemy.lastFired = 0;
        my.sprite.large_enemy.health = 5;

        my.sprite.large_enemy2 = this.add.sprite(game.config.width/4, 80, "large");
        my.sprite.large_enemy2.scorePoints = 100;
        my.sprite.large_enemy2.setScale(2.5);
        my.sprite.large_enemy2.setFlipY(true);
        my.sprite.large_enemy2.direction = 1;
        my.sprite.large_enemy2.speed = 0.3;
        my.sprite.large_enemy2.lastFired = 0;
        my.sprite.large_enemy2.health = 5;

        // I know I probably could've done the set path stuff we went over but this seemed more precise
        this.time.addEvent({
            delay: 2000, // 2 seconds, 1000 = 1 second, measured in ms (convert to s for human eyes lol)
            callback: () => {
                my.sprite.medium_enemy.direction *= -1;
                // my.sprite.medium_enemy_left.direction *= -1;
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

        // For small pyramid spawn
        this.spawnCounter = 0;

        // Set movement speeds (in pixels/tick)
        this.playerSpeed = 5;
        this.bulletSpeed = 5;

        // update HTML description
        document.getElementById('description').innerHTML = '<h2>Planes Invader.js</h2><br>A: left // D: right // Space: fire/emit'
        // Put score on screen
        my.text.score = this.add.bitmapText(550, 0, "rocketSquare", "Score " + this.myScore);

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
            if (currentTime - my.sprite.medium_enemy.lastFired > 3000) {
                this.fireMediumEnemyBullet(my.sprite.medium_enemy.x, my.sprite.medium_enemy.y);
                my.sprite.medium_enemy.lastFired = currentTime;
            }
        }

        if (my.sprite.large_enemy.visible) {
            if (!my.sprite.large_enemy.time) {
                my.sprite.large_enemy.time = 0;
            }
            my.sprite.large_enemy.time += 0.2;

            let amplitude = 150;
            let frequency = 0.2;
            my.sprite.large_enemy.x = game.config.width/4 + amplitude * Math.sin(my.sprite.large_enemy.time * frequency);
            my.sprite.large_enemy.y += my.sprite.large_enemy.speed;

            if (my.sprite.large_enemy.y > game.config.height) {
                my.sprite.large_enemy.visible = false;
                my.sprite.large_enemy.destroy();

                if (my.sprite.health.length > 0) {
                    let lostHealth = my.sprite.health.pop();
                    this.sound.play("damage", {
                        volume: 1   
                    });
                    lostHealth.destroy();
                }

                if (my.sprite.health.length === 0) {
                    this.gameOver();
                }
            }

            let currentTime = this.time.now;
            if (currentTime - my.sprite.large_enemy.lastFired > 2000) {
                this.fireLargeEnemyBullet(my.sprite.large_enemy.x, my.sprite.large_enemy.y);
                my.sprite.large_enemy.lastFired = currentTime;
            }
        }

        if (my.sprite.large_enemy2.visible) {
            if (!my.sprite.large_enemy2.time) {
                my.sprite.large_enemy2.time = 0;
            }
            my.sprite.large_enemy2.time += 0.2;

            let amplitude = 150;
            let frequency = 0.2;
            my.sprite.large_enemy2.x = 3 * game.config.width/4 + amplitude * Math.sin(my.sprite.large_enemy2.time * frequency);
            my.sprite.large_enemy2.y += my.sprite.large_enemy2.speed;

            if (my.sprite.large_enemy2.y > game.config.height) {
                my.sprite.large_enemy2.visible = false;
                my.sprite.large_enemy2.destroy();

                if (my.sprite.health.length > 0) {
                    let lostHealth = my.sprite.health.pop();
                    this.sound.play("damage", {
                        volume: 1 
                    });
                    lostHealth.destroy();
                }

                if (my.sprite.health.length === 0) {
                    this.gameOver();
                }
            }

            let currentTime = this.time.now;
            if (currentTime - my.sprite.large_enemy2.lastFired > 2000) {
                this.fireLargeEnemyBullet(my.sprite.large_enemy2.x, my.sprite.large_enemy2.y);
                my.sprite.large_enemy2.lastFired = currentTime;
            }
        }


        // Move small enemy pyramid forward
        for (let enemy of my.sprite.enemies) {
            if (enemy.visible) {
                enemy.y += 1;

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
            let currentTime = this.time.now;
            if (currentTime - this.bulletFired > this.fireRate) {
                if (my.sprite.bullet.length < this.maxBullets) {
                    my.sprite.bullet.push(this.add.sprite(
                        my.sprite.player.x, my.sprite.player.y-(my.sprite.player.displayHeight/2), "pbullet")
                );
                this.bulletFired = currentTime;
                }
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
            if (this.collides(my.sprite.medium_enemy, bullet)){ 
                this.sound.play("smallping", {
                    volume: 0.8
                }); // hit sound but lower volume so players know they hit it but plane not down yet 
                
                // clear out bullet -- put y offscreen, will get reaped next update
                bullet.y = -100;

                my.sprite.medium_enemy.health -= 1; 
                if (my.sprite.medium_enemy.health <= 0) {
                    this.puff = this.add.sprite(my.sprite.medium_enemy.x, my.sprite.medium_enemy.y, "whitePuff03").setScale(0.4).play("puff");
                    my.sprite.medium_enemy.visible = false;
                    my.sprite.medium_enemy.x = -100;
                
                    // Update score
                    this.myScore += my.sprite.medium_enemy.scorePoints;
                    this.updateScore();
                    // Play sound
                    this.sound.play("smallping", {
                        volume: 1   // Can adjust volume using this, goes from 0 to 1
                    });
                }
            }

            if (this.collides(my.sprite.large_enemy, bullet)){ 
                this.sound.play("smallping", {
                    volume: 0.8
                });
                // clear out bullet -- put y offscreen, will get reaped next update
                bullet.y = -100;

                my.sprite.large_enemy.health -= 1; 
                if (my.sprite.large_enemy.health <= 0) {
                    this.puff = this.add.sprite(my.sprite.large_enemy.x, my.sprite.large_enemy.y, "whitePuff03").setScale(0.6).play("puff");
                    my.sprite.large_enemy.visible = false;
                    my.sprite.large_enemy.x = -100;
                
                    // Update score
                    this.myScore += my.sprite.large_enemy.scorePoints;
                    this.updateScore();
                    // Play sound
                    this.sound.play("smallping", {
                        volume: 1   // Can adjust volume using this, goes from 0 to 1
                    });
                }
            }

            if (this.collides(my.sprite.large_enemy2, bullet)){ 
                this.sound.play("smallping", {
                    volume: 0.8
                });
                // clear out bullet -- put y offscreen, will get reaped next update
                bullet.y = -100;

                my.sprite.large_enemy2.health -= 1; 
                if (my.sprite.large_enemy2.health <= 0) {
                    this.puff = this.add.sprite(my.sprite.large_enemy2.x, my.sprite.large_enemy2.y, "whitePuff03").setScale(0.6).play("puff");
                    my.sprite.large_enemy2.visible = false;
                    my.sprite.large_enemy2.x = -100;
                
                    // Update score
                    this.myScore += my.sprite.large_enemy2.scorePoints;
                    this.updateScore();
                    // Play sound
                    this.sound.play("smallping", {
                        volume: 1   // Can adjust volume using this, goes from 0 to 1
                    });
                }
            }
        }

        // Make all of the bullets move
        for (let bullet of my.sprite.bullet) {
            bullet.y -= this.bulletSpeed;
        }

        if (this.areAllSmallEnemiesDefeated() && this.spawnCounter < 2) {
            this.spawnCounter += 1; // Increment the spawn counter
            let newX = Phaser.Math.Between(50, 150); // Random X start
            this.spawnEnemyPyramid(newX);
        }

        // If all enemies are defeated next level
        if (this.areAllSmallEnemiesDefeated() && this.spawnCounter >= 2 && my.sprite.medium_enemy.health <= 0 && my.sprite.large_enemy.health <= 0 && my.sprite.large_enemy2.health <= 0) {
            this.nextLevel();
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

    nextLevel() {
        this.scene.start("level3");
    }

    gameOver() {
        for (let bullet of this.my.sprite.enemy_bullet) {
            bullet.destroy();
        }
        this.my.sprite.enemy_bullet = [];
        for (let enemy of this.my.sprite.enemies) {
            enemy.destroy();
        }
        this.my.sprite.enemies = [];
        for (let health of this.my.sprite.health) {
            health.destroy();
        }
        this.my.sprite.health = [];

        this.spawnCounter = 0;

        if (this.my.sprite.medium_enemy) {
            this.my.sprite.medium_enemy.health = 3;
        }

        this.scene.start("gameOver", { score: this.myScore });

        this.myScore = 0;
    }

}
      