import Phaser from 'phaser';

const DEBUG=false;
const SCALE=4;

var debug_log = [];
var debug_text;

var scene;

// Map variable
var map1_floor;
var map1_walls;

var layer_floor;
var layer_walls;

// Player variables
var player;

var player_velocity = 200;
const player_dir = {NONE: -1, LEFT: 0, RIGHT: 1, UP: 2, DOWN: 3};
let current_player_xdir = player_dir.RIGHT;
let current_player_ydir = player_dir.NONE;

// Input variables
var pads;
var cursors;

// Enemies
var grunts = [];

var grunt_anims = {
    idle: {
        startFrame: 0,
        endFrame: 1,
        speed: 0.2
    },
    walk: {
        startFrame: 0,
        endFrame: 1,
        speed: 0.15
    }
};

var grunt_directions = {
    west: { offset: 0, x: -2, y: 0, opposite: 'east' },
    northWest: { offset: 0, x: -2, y: -1, opposite: 'southEast' },
    north: { offset: 0, x: 0, y: -2, opposite: 'south' },
    northEast: { offset: 0, x: 2, y: -1, opposite: 'southWest' },
    east: { offset: 0, x: 2, y: 0, opposite: 'west' },
    southEast: { offset: 0, x: 2, y: 1, opposite: 'northWest' },
    south: { offset: 0, x: 0, y: 2, opposite: 'north' },
    southWest: { offset: 0, x: -2, y: 1, opposite: 'northEast' }
};

class Grunt extends Phaser.GameObjects.Image
{
    constructor(scene, x, y, motion, direction, distance)
    {
        super(scene, x, y, 'grunt')//, direction.offset);

        this.startX = x;
        this.startY = y;
        this.distance = distance;

        this.motion = motion;
        this.anim = grunt_anims[motion];
        this.direction = grunt_directions[direction];
        this.speed = 0.15;
        this.f = this.anim.startFrame;

        this.depth = y + 64;

        this.setScale(SCALE);

        scene.time.delayedCall(this.anim.speed * 1000, this.changeFrame, [], this);
    }

    changeFrame ()
    {
        this.f++;

        var delay = this.anim.speed;

        if (this.f === this.anim.endFrame)
        {
            switch (this.motion)
            {
                case 'walk':
                    this.f = this.anim.startFrame;
                    this.frame = this.texture.get(/*this.direction.offset + */this.f);
                    scene.time.delayedCall(delay * 1000, this.changeFrame, [], this);
                    break;

                case 'idle':
                    delay = 0.5 + Math.random();
                    scene.time.delayedCall(delay * 1000, this.resetAnimation, [], this);
                    break;
            }
        }
        else
        {
            this.frame = this.texture.get(/*this.direction.offset + */this.f);

            scene.time.delayedCall(delay * 1000, this.changeFrame, [], this);
        }
    }

    resetAnimation ()
    {
        this.f = this.anim.startFrame;

        this.frame = this.texture.get(/*this.direction.offset + */this.f);

        scene.time.delayedCall(this.anim.speed * 1000, this.changeFrame, [], this);
    }

    update ()
    {
        if (this.motion === 'walk')
        {
            this.x += this.direction.x * this.speed;

            if (this.direction.y !== 0)
            {
                this.y += this.direction.y * this.speed;
                this.depth = this.y + 64;
            }

            //  Walked far enough?
            if (Phaser.Math.Distance.Between(this.startX, this.startY, this.x, this.y) >= this.distance)
            {
                this.direction = grunt_directions[this.direction.opposite];
                this.f = this.anim.startFrame;
                this.frame = this.texture.get(/*this.direction.offset + */this.f);
                this.startX = this.x;
                this.startY = this.y;
            }
        }
    }
}

class MainScene extends Phaser.Scene
{
    constructor ()
    {
        super();
    }

    preload ()
    {
        // Load map
        this.load.tilemapCSV('map1_floor', 'src/assets/tilemaps/map1_floor.csv');
        this.load.tilemapCSV('map1_walls', 'src/assets/tilemaps/map1_walls.csv');
        this.load.image('tiles', 'src/assets/tilesets/tileset01.png');

        // Load player sprite sheet
        this.load.spritesheet('player', 'src/assets/player/player.png', { frameWidth: 8, frameHeight: 8});

        // Load grunt sprite sheet
        this.load.spritesheet('grunt', 'src/assets/enemies/grunt.png', { frameWidth: 8, frameHeight: 8});
    }

    create ()
    {
        scene = this;

        // Init tilemaps
        map1_floor = this.make.tilemap({ key: 'map1_floor', tileWidth: 8, tileHeight: 8 });
        map1_walls = this.make.tilemap({ key: 'map1_walls', tileWidth: 8, tileHeight: 8 });
        var tileset_floor = map1_floor.addTilesetImage('tiles');
        var tileset_walls = map1_walls.addTilesetImage('tiles');
        layer_floor = map1_floor.createLayer(0, tileset_floor, 0, 0); // layer index, tileset, x, y 
        layer_walls = map1_walls.createLayer(0, tileset_walls, 0, 0); // layer index, tileset, x, y 

        layer_floor.setScale(SCALE);
        layer_walls.setScale(SCALE);

        // Set map collision
        map1_walls.setCollision([1,2,3]);
        map1_floor.setCollision([27,34,35])

        // Init player
        this.init_player();

        // Init grunts
        this.init_grunts();

        cursors = this.input.keyboard.createCursorKeys();

        debug_text = this.add.text(0, 0, '', { font: '12px Courier', fill: '#ffffff' });
    }

    init_grunts()
    {
        grunts.push(this.add.existing(new Grunt(this, 240, 350, 'idle', 'west', 0)));
        grunts.push(this.add.existing(new Grunt(this, 140, 370, 'walk', 'northWest', 100)));
        grunts.push(this.add.existing(new Grunt(this, 340, 770, 'walk', 'southEast', 80)));
        grunts.push(this.add.existing(new Grunt(this, 540, 620, 'idle', 'east', 0)));
        grunts.push(this.add.existing(new Grunt(this, 140, 650, 'walk', 'west', 100)));

        grunts.forEach(function(grunt) {
            //this.physics.add.collider(grunt, layer_walls);
            //this.physics.add.collider(grunt, layer_floor);
        })
    }

    init_player()
    {
        // Init player animations
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { start: 2, end: 3 }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 1 }),
            frameRate: 10,
            repeat: -1
        });

        player = this.physics.add.sprite(SCALE*16, SCALE*16, 'player', 1)
            .setScale(SCALE);
        player.setSize(8, 8, false);
        
        this.physics.add.collider(player, layer_walls);
        this.physics.add.collider(player, layer_floor);

        this.cameras.main.setBounds(0,0,map1_floor.widthInPixels,map1_floor.heightInPixels);
        this.cameras.main.startFollow(player);
    }

    update(time, delta)
    {
        var pads = this.input.gamepad.gamepads;

        if (DEBUG)
        {
            debug_log = [];
            debug_log.push("pads.length: " + pads.length);
        }

        // Update grunts
        grunts.forEach(function(grunt) {
            grunt.update();
        })

        // Update player
        player.body.setVelocity(0);

        // Horizontal movement
        if (cursors.left.isDown || (pads[0] != null && pads[0].buttons[14].value==1))
        {
            player.anims.play('left', true);
            player.body.setVelocityX(-player_velocity);
            current_player_xdir = player_dir.LEFT;
        }
        else if (cursors.right.isDown || (pads[0] != null && pads[0].buttons[15].value==1))
        {
            player.anims.play('right', true);
            player.body.setVelocityX(player_velocity);
            current_player_xdir = player_dir.RIGHT;
        }
        // Vertical movement
        else if (cursors.up.isDown || (pads[0] != null && pads[0].buttons[12].value==1))
        {
            if (current_player_xdir == player_dir.LEFT)
                player.anims.play('left', true);
            else
                player.anims.play('right', true);

            player.body.setVelocityY(-player_velocity);
            current_player_ydir = player_dir.UP;
        }
        else if (cursors.down.isDown || (pads[0] != null && pads[0].buttons[13].value==1))
        {
            if (current_player_xdir == player_dir.LEFT)
                player.anims.play('left', true);
            else
                player.anims.play('right', true);

            player.body.setVelocityY(player_velocity);
            current_player_ydir = player_dir.DOWN;
        }
        else
        {
            player.anims.stop();
        }

        

        // Output debug message
        if (DEBUG) debug_text.setText(debug_log);
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1900,
    height: 1080,
    backgroundColor: '#2d2d2d',
    pixelArt: true,
    scale: {
        //mode: Phaser.Scale.FIT,
        //autoCenter: Phaser.Scale.CENTER_BOTH,
        //width: 160,
        //height: 144,
        //zoom: 2
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 } }
    },
    input: {
        gamepad: true
    },
    scene: [ MainScene ]
};

const game = new Phaser.Game(config);


