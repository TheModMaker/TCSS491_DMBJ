/////////////////////////////////////////////////////////////////////
//
// MapBase.js - Defines interaction with the main game map.
//
// Load Dependencies - <none>
// Use  Dependencies - Assets
//


// Defines a block that contains nothing.
var BLOCK_AIR_CHAR = ' ';
var BLOCK_AIR = 0;
// Defines the end of the map.
var BLOCK_END_CHAR = '*';
var BLOCK_END = 1;
// Defines the start of the map.
var BLOCK_START_CHAR = '+';
// Defines a normal wall.
var BLOCK_WALL_CHAR = '-';
var BLOCK_WALL = 0x0 + 2;
var BLOCK_WALL_U = 0x8 + BLOCK_WALL;
var BLOCK_WALL_L = 0x4 + BLOCK_WALL;
var BLOCK_WALL_D = 0x2 + BLOCK_WALL;
var BLOCK_WALL_R = 0x1 + BLOCK_WALL;
var BLOCK_WALL_UL = 0xC + BLOCK_WALL;
var BLOCK_WALL_UD = 0xA + BLOCK_WALL;
var BLOCK_WALL_UR = 0x9 + BLOCK_WALL;
var BLOCK_WALL_LD = 0x6 + BLOCK_WALL;
var BLOCK_WALL_LR = 0x5 + BLOCK_WALL;
var BLOCK_WALL_DR = 0x3 + BLOCK_WALL;
var BLOCK_WALL_ULD = 0xE + BLOCK_WALL;
var BLOCK_WALL_ULR = 0xD + BLOCK_WALL;
var BLOCK_WALL_UDR = 0xB + BLOCK_WALL;
var BLOCK_WALL_LDR = 0x7 + BLOCK_WALL;
var BLOCK_WALL_ULDR = 0xF + BLOCK_WALL;
// Defines a wall that cannot receive a portal.
var BLOCK_NO_WALL_CHAR = '=';
var BLOCK_NO_WALL = 0x0 + BLOCK_WALL_ULDR + 1;
var BLOCK_NO_WALL_U = 0x8 + BLOCK_NO_WALL;
var BLOCK_NO_WALL_L = 0x4 + BLOCK_NO_WALL;
var BLOCK_NO_WALL_D = 0x2 + BLOCK_NO_WALL;
var BLOCK_NO_WALL_R = 0x1 + BLOCK_NO_WALL;
var BLOCK_NO_WALL_UL = 0xC + BLOCK_NO_WALL;
var BLOCK_NO_WALL_UD = 0xA + BLOCK_NO_WALL;
var BLOCK_NO_WALL_UR = 0x9 + BLOCK_NO_WALL;
var BLOCK_NO_WALL_LD = 0x6 + BLOCK_NO_WALL;
var BLOCK_NO_WALL_LR = 0x5 + BLOCK_NO_WALL;
var BLOCK_NO_WALL_DR = 0x3 + BLOCK_NO_WALL;
var BLOCK_NO_WALL_ULD = 0xE + BLOCK_NO_WALL;
var BLOCK_NO_WALL_ULR = 0xD + BLOCK_NO_WALL;
var BLOCK_NO_WALL_UDR = 0xB + BLOCK_NO_WALL;
var BLOCK_NO_WALL_LDR = 0x7 + BLOCK_NO_WALL;
var BLOCK_NO_WALL_ULDR = 0xF + BLOCK_NO_WALL;

// Defines the characters that will kill the player.
var BLOCK_KILL_CHAR = "~`!@#$%^&()[{]}\\|;:'\",<.>/?".split("");

// Contains the width/height of blocks on the map.
var BLOCK_WIDTH = 16;

// Constructor, creates a new map.
// - map : The text that defines the map.
//
// Members:
// - startX : The start x-position.
// - startY : The start y-position.
// - endX : The end x-position.
// - endY : The end y-position.
// - function draw(assets, x, y) : Draws the map using the given assets when the map has scrolled the given amount.
// - function step(dt) : Updates the map using the given delta-time.
// - function isSolid(x, y) : Determines if the given block is solid.
function Map(map) {
	this.assets = [];
	this.assets[BLOCK_WALL_CHAR] = BLOCK_WALL;
	this.assets[BLOCK_NO_WALL_CHAR] = BLOCK_NO_WALL;
	this.assets[BLOCK_END_CHAR] = BLOCK_END;

	var level = map.split("\n");
	if (level[0] === "")
		level.splice(0, 1);
	this.height = level.length * BLOCK_WIDTH;
	this.width = level[0].length * BLOCK_WIDTH;

	if (DEBUG) {
		for (var i = 1; i < level.length; i++) 
			if (level[i].length * BLOCK_WIDTH != this.width)
				console.log("In a map section, all lines must have the same width.");
	}

	var canvas = document.createElement("canvas");
	canvas.width = this.width;
	canvas.height = this.height;

	// Gets the wall type for the given index.
	this.compile = function(assets) {
		function WallType(wall, lines, x, y) {
			var u = !(y === 0 || lines[y - 1][x] === BLOCK_WALL_CHAR || lines[y - 1][x] === BLOCK_NO_WALL_CHAR);
			var d = !(y === lines.length - 1 || lines[y + 1][x] === BLOCK_WALL_CHAR || lines[y + 1][x] === BLOCK_NO_WALL_CHAR);
			var l = !(x === 0 || lines[y][x - 1] === BLOCK_WALL_CHAR || lines[y][x - 1] === BLOCK_NO_WALL_CHAR);
			var r = !(x === lines[y].length - 1 || lines[y][x + 1] === BLOCK_WALL_CHAR || lines[y][x + 1] === BLOCK_NO_WALL_CHAR);

			return wall + (u << 3) + (l << 2) + (d << 1) + (r);
		}

		// Compile the lines into the object.
		var ctx = canvas.getContext("2d");
		for (var y = 0; y < level.length; y++) {
			var line = level[y];
			for (var x = 0; x < line.length; x++) {
				var c = line[x];
				var i = 0;
				switch (c) {
					case BLOCK_AIR_CHAR: 
						break;
					case BLOCK_WALL_CHAR:
					case BLOCK_NO_WALL_CHAR: 
						i = WallType(this.assets[c], level, x, y); 
						break;
					case BLOCK_START_CHAR:
						if (DEBUG && this.startX !== undefined)
							console.log("Duplicate start position.");

						this.startX = x * BLOCK_WIDTH;
						this.startY = (y - 1) * BLOCK_WIDTH;
						break;
					case BLOCK_END_CHAR:
						i = BLOCK_END;
						if (DEBUG && this.endX !== undefined)
							console.log("Duplicate end position.");
						
						this.endX = x * BLOCK_WIDTH;
						this.endY = y * BLOCK_WIDTH;
						break;
					default:
						if (BLOCK_KILL_CHAR.indexOf(c) != -1) {
							i = this.assets[c];
						} else if (DEBUG) {
							console.log("Unknown map part '" + c + "'.");
						}
						break;
				}
				if (i != 0)
					assets[i].draw(x * BLOCK_WIDTH, y * BLOCK_WIDTH, 1, 1, false, false, ctx);
			}
		}
		if (DEBUG) {
			if (map.startX === undefined)
				console.log("Missing start position.");
			if (map.endX === undefined)
				console.log("Missing end position.");
		}
	};

	this.draw = function(x, y) {
		CONTEXT.drawImage(canvas, x, y, CANVAS.width, CANVAS.height, 0, 0, CANVAS.width, CANVAS.height);
	};
	this.step = function(dt) {
	};
	this.isSolid = function(x, y) {
		if (x < 0 || y < 0 || y >= level.length || x >= level[y].length)
			return 2;

		var c = level[y][x];
		switch (c) {
			case BLOCK_WALL_CHAR: 	return 1;
			case BLOCK_NO_WALL_CHAR:return 2;
			case BLOCK_END_CHAR: 	return false;
			case BLOCK_START_CHAR: 	return undefined;
			case BLOCK_AIR_CHAR: 	return undefined;
			default: 				return null;
		}
	};
}

// Creates a new map manager, is an array.
var MAPS = (function() {
	var maps = [];
	maps.current = 0;

	maps.compile = function() {
        var img = ASSETS["level"];
        var frames = SimpleFrames(img.width, img.height, 64, 8, 8);
        var sheet = new SpriteSheet(img, frames);

        for (var i = 0; i < maps.length; i++) {
        	maps[i].compile(sheet);
        }
	};
	maps.switchTo = function(i) {
		this.current = i;
	};
	maps.nextLevel = function() {
		this.current++;
	};

	maps.draw = function(x, y) {
		this[this.current].draw(x, y);
	};
	maps.step = function(dt) {
		this[this.current].step(dt);

		this.width = this[this.current].width;
		this.height = this[this.current].height;
	};

	return maps;
})();