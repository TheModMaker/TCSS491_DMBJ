/////////////////////////////////////////////////////////////////////
//
// MapBase.js - Defines interaction with the main game map.
//
// Load Dependencies - <none>
// Use  Dependencies - <none>
//


// Defines a block that contains nothing.
var BLOCK_AIR_CHAR = ' ';
var BLOCK_AIR = BLOCK_AIR_CHAR;
// Defines a normal wall.
var BLOCK_WALL_CHAR = '-';
var BLOCK_WALL = BLOCK_WALL_CHAR;
// Defines a wall that cannot receive a portal.
var BLOCK_NO_PORTAL_CHAR = '=';
var BLOCK_NO_PORTAL = BLOCK_NO_PORTAL_CHAR;
// Defines the end of the map.
var BLOCK_END_CHAR = '*';
var BLOCK_END = BLOCK_END_CHAR;
// Defines the start of the map.
var BLOCK_START_CHAR = '+';

// Defines the characters that will kill the player.
var BLOCK_KILL_CHAR = "~`!@#$%^&()[{]}\\|;:'\",<.>/?".split("");
var BLOCK_KILL = BLOCK_KILL_CHAR[0];

// Defines the solid blocks.
var BLOCK_SOLID = [BLOCK_WALL, BLOCK_NO_PORTAL];

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
	(function toLines() {
		// Store the parts into an [y][x] array by it's relative position.
		var sections = [];
		for (var i = 0; i < args.length; i++) {
			var x = args[i].x;
			var y = args[i].y;

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

	// Converts a string line into an array object.
	var map = this;
	function compile(line, y) {
		var ret = [];
		for (var i = 0; i < line.length; i++) {
			var c = line[i];
			if (c === BLOCK_AIR_CHAR) {
				ret[i] = BLOCK_AIR;
			} else if (c === BLOCK_WALL_CHAR) {
				ret[i] = BLOCK_WALL;
			} else if (c === BLOCK_NO_PORTAL_CHAR) {
				ret[i] = BLOCK_NO_PORTAL;
			} else if (c === BLOCK_START_CHAR) {
				ret[i] = BLOCK_AIR;

				if (DEBUG) {
					if (map.startX !== undefined)
						console.log("Duplicate start position.");
				}

				map.startX = i * BLOCK_WIDTH;
				map.startY = (y - 1) * BLOCK_WIDTH;
			} else if (c === BLOCK_END_CHAR) {
				ret[i] = BLOCK_END;

				if (DEBUG) {
					if (map.endX !== undefined)
						console.log("Duplicate end position.");
				}
				
				map.endX = i * BLOCK_WIDTH;
				map.endY = y * BLOCK_WIDTH;
			} else if (BLOCK_KILL_CHAR.indexOf(c) != -1) {
				ret[i] = BLOCK_KILL;
			}
		}

		return ret;
	}

	// Compile the lines into the object.
	for (var i = 0; i < level.length; i++) {
		level[i] = compile(level[i], i);
	}
	if (DEBUG) {
		if (map.startX === undefined)
			console.log("Missing start position.");
		if (map.endX === undefined)
			console.log("Missing end position.");
	}

	this.draw = function(assets, x, y) {
		for (var j = 0; j < level.length; j++) {
			var row = level[j];
			for (var i = 0; i < row.length; i++) {
				var img = assets[row[i]];
				img.draw(BLOCK_WIDTH * i - x, BLOCK_WIDTH * j - y);
			}
		}
	};
	this.step = function(dt) {
	};
	this.isSolid = function(x, y) {
		if (x < 0 || y < 0 || y >= level.length || x >= level[y])
			return false;
		else if (level[y][x] === BLOCK_KILL)
			return 1;
		else if (level[y][x] === BLOCK_END)
			return 2;
		else
			return (BLOCK_SOLID.indexOf(level[y][x]) != -1);
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