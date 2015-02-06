/////////////////////////////////////////////////////////////////////
//
// MapBase.js - Defines interaction with the main game map.
//
// Load Dependencies - <none>
// Use  Dependencies - jQuery
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

// Constructor, creates a section on a map.
// - map : The text that defines the section.
//
// Members:
// - x : Defines the relative position of this section.
// - y : Defines the relative position of this section.
function MapSection(map) {
	this.x = 0;
	this.y = 0;

	this.kills = [];

	this.lines = map.split("\n");
	if (this.lines[0] === "")
		this.lines.splice(0, 1);
	this.height = this.lines.length;
	this.width = this.lines[0].length;

	if (DEBUG) {
		for (var i = 1; i < this.lines.length; i++) 
			if (this.lines[i].length != this.width)
				console.log("In a map section, all lines must have the same width.");
	}
}

// Constructor, creates a new map.
// - *Accepts a variable number of arguments that defines map sections.
//
// Members:
// - startX : The start x-position.
// - startY : The start y-position.
// - endX : The end x-position.
// - endY : The end y-position.
// - function draw(assets, x, y) : Draws the map using the given assets when the map has scrolled the given amount.
// - function step(dt) : Updates the map using the given delta-time.
// - function isSolid(x, y) : Determines if the given block is solid.
function Map() {
	var args = arguments;
	var level = [];
	var kills = [];
	(function toLines() {
		// Store the parts into an [y][x] array by it's relative position.
		var sections = [];
		for (var i = 0; i < args.length; i++) {
			var x = args[i].x;
			var y = args[i].y;

			$.extend(kills, args[i].kills);

			sections[y] = sections[y] || [];
			sections[y][x] = args[i];
		}

		// Verify that the sections are correct.
		if (DEBUG) {
			var w = args[0].width;
			var h = args[0].height;

			for (var i = 1; i < args.length; i++) {
				if (args[i].width != w || args[i].height != h)
					console.log("All map sections must be the same size.");
			}
			for (var x = 0; x < sections.length; x++) {
				if (!sections[x])
					console.log("There is a missing section in the map.");
				for (var y = 0; y < sections[x].length; y++) {
					if (!sections[x][y])
						console.log("There is a missing section in the map.")
				}
			}
		}

		// Convert the parts to a simple array of lines.
		for (var i = 0; i < sections.length; i++) {
			for (var j = 0; j < sections[i].length; j++) {
				var sect = sections[i][j];
				var lines = sect.lines;
				for (var x = 0; x < lines.length; x++) {
					var cur = level[i * lines.length + x] || "";
					level[i * lines.length + x] = cur + lines[x];
				}
			}
		}
	})();

	// Gets the wall type for the given index.
	function WallType(wall, lines, x, y) {
		var u = !(y === 0 || lines[y - 1][x] === BLOCK_WALL_CHAR || lines[y - 1][x] === BLOCK_NO_WALL_CHAR);
		var d = !(y === lines.length - 1 || lines[y + 1][x] === BLOCK_WALL_CHAR || lines[y + 1][x] === BLOCK_NO_WALL_CHAR);
		var l = !(x === 0 || lines[y][x - 1] === BLOCK_WALL_CHAR || lines[y][x - 1] === BLOCK_NO_WALL_CHAR);
		var r = !(x === lines[y].length - 1 || lines[y][x + 1] === BLOCK_WALL_CHAR || lines[y][x + 1] === BLOCK_NO_WALL_CHAR);

		return wall + (u << 3) + (l << 2) + (d << 1) + (r);
	}

	// Compile the lines into the object.
	var lines = level.slice(0);
	for (var y = 0; y < lines.length; y++) {
		var line = lines[y];
		var ret = [];
		for (var x = 0; x < line.length; x++) {
			var c = line[x];
			if (c === BLOCK_AIR_CHAR) {
				ret[x] = BLOCK_AIR;
			} else if (c === BLOCK_WALL_CHAR) {
				ret[x] = WallType(BLOCK_WALL, lines, x, y);
			} else if (c === BLOCK_NO_WALL_CHAR) {
				ret[x] = WallType(BLOCK_NO_WALL, lines, x, y);
			} else if (BLOCK_KILL_CHAR.indexOf(c) != -1) {
				ret[x] = kills[c];
			} else if (c === BLOCK_START_CHAR) {
				ret[x] = BLOCK_AIR;

				if (DEBUG) {
					if (this.startX !== undefined)
						console.log("Duplicate start position.");
				}

				this.startX = x * BLOCK_WIDTH;
				this.startY = (y - 1) * BLOCK_WIDTH;
			} else if (c === BLOCK_END_CHAR) {
				ret[x] = BLOCK_END;

				if (DEBUG) {
					if (this.endX !== undefined)
						console.log("Duplicate end position.");
				}
				
				this.endX = x * BLOCK_WIDTH;
				this.endY = y * BLOCK_WIDTH;
			}
		}

		level[y] = ret;
	}
	if (DEBUG) {
		if (map.startX === undefined)
			console.log("Missing start position.");
		if (map.endX === undefined)
			console.log("Missing end position.");
	}

	this.draw = function(assets, x, y) {
		var minX = Math.max(0, Math.floor(x / BLOCK_WIDTH));
		var maxX = Math.min(level[0].length, Math.ceil((x + CANVAS.width) / BLOCK_WIDTH));
		var minY = Math.max(0, Math.floor(y / BLOCK_WIDTH));
		var maxY = Math.min(level.length, Math.ceil((y + CANVAS.height) / BLOCK_WIDTH));

		for (var j = minY; j < maxY; j++) {
			var row = level[j];
			for (var i = minX; i < maxX; i++) {
				if (row[i] !== BLOCK_AIR) {
					var img = assets[row[i]];
					img.draw(BLOCK_WIDTH * i - x, BLOCK_WIDTH * j - y);
				}
			}
		}
	};
	this.step = function(dt) {
	};
	this.isSolid = function(x, y) {
		if (x < 0 || y < 0 || y >= level.length || x >= level[y])
			return false;
		else if (level[y][x] >= BLOCK_NO_WALL_ULDR)
			return 1;
		else if (level[y][x] === BLOCK_END)
			return 2;
		else
			return (level[y][x] !== BLOCK_AIR);
	};

	this.height = level.length * BLOCK_WIDTH;
	this.width = level[0].length * BLOCK_WIDTH;
}

// Creates a new map manager, is an array.
function MapManager() {
	this.current = 0;
	var maps = [];
	var assets = {};

	maps.setAssets = function(a) {
		assets = a;
	};
	maps.switchTo = function(i) {
		this.current = i;
	};
	maps.nextLevel = function() {
		this.current++;
	};

	maps.draw = function(x, y) {
		this[this.current].draw(assets, x, y);
	};
	maps.step = function(dt) {
		if (this.current >= 0 && this.current < this.length) {
			this[this.current].step(dt);

			this.width = this[this.current].width;
			this.height = this[this.current].height;
		}
	};

	return maps;
}

var MAPS = MapManager();