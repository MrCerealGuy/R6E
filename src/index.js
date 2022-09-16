import Phaser from 'phaser';

var config = {
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
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

const DEBUG=false;
const SCALE=4;

var debug_log = [];
var debug_text;

// Map variable
var map1_floor;
var map1_walls;

// Player variables
var player;

var player_velocity = 200;
const player_dir = {NONE: -1, LEFT: 0, RIGHT: 1, UP: 2, DOWN: 3};
let current_player_xdir = player_dir.RIGHT;
let current_player_ydir = player_dir.NONE;

// Input variables
var pads;
var cursors;

function preload ()
{
    this.load.tilemapCSV('map1_floor', 'src/assets/tilemaps/map1_floor.csv');
    this.load.tilemapCSV('map1_walls', 'src/assets/tilemaps/map1_walls.csv');
    this.load.image('tiles', 'src/assets/tilesets/tileset01.png');
    this.load.spritesheet('player', 'src/assets/player/player.png', { frameWidth: 8, frameHeight: 8});
}

function create ()
{
    // Init tilemaps
    map1_floor = this.make.tilemap({ key: 'map1_floor', tileWidth: 8, tileHeight: 8 });
    map1_walls = this.make.tilemap({ key: 'map1_walls', tileWidth: 8, tileHeight: 8 });
    var tileset_floor = map1_floor.addTilesetImage('tiles');
    var tileset_walls = map1_walls.addTilesetImage('tiles');
    var layer_floor = map1_floor.createLayer(0, tileset_floor, 0, 0); // layer index, tileset, x, y 
    var layer_walls = map1_walls.createLayer(0, tileset_walls, 0, 0); // layer index, tileset, x, y 

    layer_floor.setScale(SCALE);
    layer_walls.setScale(SCALE);

    // Set map collision
    map1_walls.setCollision([1,2,3]);
    map1_floor.setCollision([27,34,35])

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

    this.cameras.main.startFollow(player);

    cursors = this.input.keyboard.createCursorKeys();

    debug_text = this.add.text(0, 0, '', { font: '12px Courier', fill: '#ffffff' });
}

function init_player()
{
    
}

function update(time, delta)
{
    var pads = this.input.gamepad.gamepads;

    if (DEBUG)
    {
        debug_log = [];
        debug_log.push("pads.length: " + pads.length);
    }

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

    if (DEBUG) debug_text.setText(debug_log);
}

window.addEventListener('resize', function (event) {

    game.scale.setMaxZoom();

}, false);
