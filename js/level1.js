function rand() {
    return Math.floor((Math.random() * 100) + 1);
}

function rand2() {
    return Math.floor((Math.random() * (20*16-40)) + 20);
}

var level1 = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:

        function level1() {
            Phaser.Scene.call(this, { key: 'level1' });
        },

    preload: function preload() {
        // 60x20 16px tiles
        this.load.image('ground', 'assets/ground.png');
        // Need to load walls seperately for collision purposes
        // 60x2 16px tiles
        this.load.image('walls_upper', 'assets/walls_upper.png');
        this.load.image('walls_lower', 'assets/walls_lower.png');
        // 1x18 16px tiles
        this.load.image('walls_left', 'assets/walls_left.png');
        this.load.image('walls_right', 'assets/walls_right.png');
        // 2x18 16px tiles
        this.load.image('walls_mid', 'assets/walls_mid.png');
        // Load the player as a spritesheet
        this.load.spritesheet('player', 'assets/player.png', { frameWidth: 16, frameHeight: 19 });
        // 16px ladder
        this.load.image('ladder', 'assets/ladder.png');
        // Menu icon
        this.load.image('menu', 'assets/menu.png');
        // Box
        this.load.image('box','assets/box.png')
        // Zone
        this.load.image('zone', 'assets/place.png');
    },

    create: function create() {
        // Add ground
        this.add.image(60 * 16 / 2, 20 * 16 / 2, 'ground');

        // Add ladders
        ladders = this.physics.add.staticGroup();
        ladders.create(19 * 16 - 8, 20 * 16 / 2, 'ladder').setVisible(false); // room 1->2
        ladders.create(39 * 16 - 8, 20 * 16 / 2, 'ladder').setVisible(false); // room 2->3
        ladders.create(59 * 16 - 8, 20 * 16 / 2, 'ladder').setVisible(false); // next level

        // Add walls
        walls = this.physics.add.staticGroup();
        walls.create(60 * 16 / 2, 8, 'walls_upper');
        walls.create(2, 20 * 16 / 2, 'walls_left');
        walls.create(60 * 16 - 8, 20 * 16 / 2, 'walls_right');
        walls.create(20 * 16, 20 * 16 / 2, 'walls_mid');
        walls.create(40 * 16, 20 * 16 / 2, 'walls_mid');
        walls.create(60 * 16 / 2, 20 * 16 - 8, 'walls_lower');

        // Add player
        player = this.physics.add.sprite(2 * 16, 10 * 16, 'player');

        // Add player animations
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 1, end: 3 }),
            frameRate: 10,
        })
        this.anims.create({
            key: 'wait',
            frames: [{ key: 'player', frame: 0 }],
            frameRate: 10
        })

        // Collide player with the walls
        this.physics.add.collider(player, walls);

        // Camera controls
        this.cameras.main.startFollow(player, true);

        // -------------------=[ ROOM 1 ]=-------------------------------
        var success = 4;
        text1 = this.add.text(3, -22, 'Room 1: Complete the equations', {
            fontSize: '16px',
            fill: '#ddd',
            fontFamily: 'Droid Sans',
            backgroundColor: '#88f'
        });
        
        // Equations
        for( var i=0; i<4; i++) {
            n1 = rand();
            n2 = rand();
            while (n1 + n2 > 100) {
                n1 = rand();
                n2 = rand();
            }

            question = this.add.text(6*16, (2+5*i)*16, n1.toString()+' + '+ n2.toString()+' =', {
                fontSize: '20px',
                fontFamily: 'Droid Sans Mono',
                fill: '#fff'
            });
            zone = this.physics.add.staticGroup();

            zone.create(14*16, (2+5*i)*16+12, 'zone');

            ans = this.add.text(rand2(), rand2(), (n1+n2).toString(), {
                fontSize: '20px',
                fontFamily: 'Droid Sans Mono',
                fill: '#fff',
                backgroundColor: '#000'
            });
            this.physics.world.enable(ans);

            this.physics.add.overlap(player, ans, function (player, ans) {
                ans.setX(player.getCenter().x);
                ans.setY(player.getCenter().y);
            }, null, this);

            this.physics.add.overlap(zone, ans, function(ans, zone) {
                zone.destroy();
                var coords = player.getCenter();
                this.add.text(coords.x, coords.y, ans.text,  {
                    fontSize: '20px',
                    fontFamily: 'Droid Sans Mono',
                    fill: '#0f0',
                    backgroundColor: '#000'
                });
                ans.destroy();
                success -= 1;
                if (!success) {
                    this.cameras.main.flash();
                    ladders.children.entries[0].setVisible(true);
                }
            }, null, this); // DONT FORGET THIS!!!

            this.physics.add.collider(walls, ans);
        }

        // Collider for room 1->2
        this.physics.add.collider(player, ladders.children.entries[0], function (player, ladder) {
            if (!success) {
                this.cameras.main.fadeIn(600);
                text1.destroy();
                player.x += 16 * 3;
                text2 = this.add.text(3+20*16, -22, 'Room 2: Whatevs', {
                    fontSize: '16px',
                    fill: '#ddd',
                    fontFamily: 'Droid Sans',
                    backgroundColor: '#88f'
                });
            }
        }, null, this);

        // -------------------=[ ROOM 2 ]=-------------------------------
        // Collider for room 2->3
        this.physics.add.collider(player, ladders.children.entries[1], function (player, ladder) {
            this.cameras.main.fadeIn(600);
            text2.destroy();
            player.x += 16 * 3;
            text3 = this.add.text(3+40*16, -22, 'Room 3: Go die', {
                fontSize: '16px',
                fill: '#ddd',
                fontFamily: 'Droid Sans',
                backgroundColor: '#88f'
            });
        }, null, this);

        // -------------------=[ ROOM 3 ]=-------------------------------
        // Collide player with the last ladder to go to the next level
        this.physics.add.collider(player, ladders.children.entries[2], function (player, ladder) {
            player.setVelocity(0, 0);
            this.scene.start('level2');
        }, null, this);
    },

    update: function update() {
        // Touch controls
        if (this.input.activePointer.isDown) {
            if (this.input.activePointer.x - gameWidth / 2 < 0) {
                player.flipX = true;
            } else {
                player.flipX = false;
            }
            player.setVelocityX((this.input.activePointer.x - gameWidth / 2) * 2);
            player.setVelocityY((this.input.activePointer.y - gameHeight / 2) * 2);
            player.anims.play('right', true);
        } else {
            player.setVelocityX(0);
            player.setVelocityY(0);
            player.anims.play('wait', true);
        }
    },
})
