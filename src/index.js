import Phaser from 'phaser';

var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#2d2d2d',
    pixelArt: true,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 160,
        height: 144,
        zoom: 2
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);
var map1_floor;
var map1_walls;

function preload ()
{
    this.load.tilemapCSV('map1_floor', 'src/assets/tilemaps/map1_floor.csv');
    this.load.tilemapCSV('map1_walls', 'src/assets/tilemaps/map1_walls.csv');
    this.load.image('tiles', 'src/assets/tilesets/tileset01.png');
}

function create ()
{
    map1_floor = this.make.tilemap({ key: 'map1_floor', tileWidth: 8, tileHeight: 8 });
    map1_walls = this.make.tilemap({ key: 'map1_walls', tileWidth: 8, tileHeight: 8 });
    var tileset_floor = map1_floor.addTilesetImage('tiles');
    var tileset_walls = map1_walls.addTilesetImage('tiles');
    var layer_floor = map1_floor.createLayer(0, tileset_floor, 0, 0); // layer index, tileset, x, y 
    var layer_walls = map1_walls.createLayer(0, tileset_walls, 0, 0); // layer index, tileset, x, y 
}

function update()
{

}

window.addEventListener('resize', function (event) {

    game.scale.setMaxZoom();

}, false);
