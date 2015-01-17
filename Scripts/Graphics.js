/////////////////////////////////////////////////////////////////////
//
// Graphics.js - Defines graphics components for the game.
//
// Depends on - jQuery
//
var canvas = null;
var context = null;
var animations = null;

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (/* function */ callback, /* DOMElement */ element) {
                window.setTimeout(callback, 1000 / 60);
            };
})();

// Constructor, defines a SpriteSheet wrapper for an image.
// - img : The <img> tag that contins the image.
// - count : the number of frames in the image.
// - widthCount : The number of frames wide.
// - heightCount : The number of frames high.
// - frameWidth : The width of a frame.
// - frameHeight : The height of a frame.
// - offsetWidth : The x offest of the start.
// - offsetHeight : The y offest of the start.
//
// Members:
// - width : The width of the image to draw.
// - height : The height of the image to draw.
// - this[i] : Gets the frame with the given index with the given members.
//      - function draw() : Draws the frame to the canvas.
function SpriteSheet(img, count, widthCount, heightCount, offsetWidth, offsetHeight, frameWidth, frameHeight) {
	var sheet = this;

	offsetWidth = offsetWidth || 0;
	offsetHeight = offsetHeight || 0;
	frameWidth = frameWidth || ((img.width - offsetWidth) / widthCount);
	frameHeight = frameHeight || ((img.height - offsetHeight) / heightCount);

	this.width = frameWidth;
	this.height = frameHeight;

	function SheetItem(index) {
		this.draw = function(x, y) {
			var frameX = Math.floor(index % widthCount);
			var frameY = Math.floor(index / widthCount);

			context.drawImage(
				img.img, 
				frameWidth * frameX + offsetWidth, frameHeight * frameY + offsetHeight,
				frameWidth, frameHeight,
				x, y,
				sheet.width, sheet.height);
		};
	};

	for (var i = 0; i < count; i++) {
		this[i] = new SheetItem(i);
	}
}

// Constructor, defines an Animation that controls an animation on a SpriteSheet.
// - sheet : The SpriteSheet that holds the image.
// - start : The start index of the animation in the sprite sheet.
// - count : The number of frames in the animation.
// - time : The time between frames (in sec).
// - loop : Whether the animation should loop.
// - reverse : Whether the animation should be reversed.
// - bothDir : Whether the animation should play forward then reverse, ignores reverse.
//
// Members:
// - function draw(x, y) : Draws the current image at the given coords.
// - function step(dt) : Updates the current frame with the given delta-time.
// - function reset() : Resets the current animation position.
// - function start() : Sets the animation to playing.
// - function stop() : Sets the animation to idle.
function Animation(sheet, start, count, time, loop, reverse, bothDir) {
	var elapsed = 0;
	var running = true;

	function frameCount() {
		if (bothDir) return 2 * count - 2;
		else return count;
	}

	this.draw = function(x, y) {
		if (running) {
			var index = Math.floor(elapsed / time);
			if (reverse)
				index = (count - index - 1);
			if (index >= count)
				count = 2 * count - index - 2;
			index += start;

			sheet[index].draw(x, y);
		}
	};
	this.step = function(dt) {
		elapsed += dt;
		if (elapsed > time * frameCount()) {
			elapsed = 0;
			if (!loop)
				running = false;

			return true;
		}

		return false;
	};
	this.reset = function() {
		elapsed = 0;
	};
	this.start = function() {
		elapsed = 0;
		running = true;
	};
	this.stop = function() {
		running = false;
	};
}

// Constructor, defines a set of animations for a sprite sheet.
// - anims : An array of possible Animation's.
//
// Members:
// - x : The current x position.
// - y : The current y position.
// - function draw() : Draws the current animation.
// - function step(dx) : Updates the current frame with the given delta-time.
// - function switchTo(i) : Switches the current animation to the given index.
// - function smoothSwitch(i) : Switches the current animation smoothly.
// - function clone() : Creates a copy of the current AnimationSet.
function AnimationSet(anims) {
	var curAnim = 0;
	var switchAnim = null;

	this.x = 0;
	this.y = 0;

	this.draw = function() {
		anims[curAnim].draw(this.x, this.y);
	};
	this.step = function(dx) {
		if (anims[curAnim].step(dx) && switchAnim != null) {
			curAnim = switchAnim;
			switchAnim = null;
		}
	};
	this.switchTo = function(i) {
		curAnim = i;
		switchAnim = null;
		anims[i].start();
	};
	this.smoothSwitch = function(i) {
		switchAnim = i;
	};
	this.clone = function() {
		return new AnimationSet(anims);
	};
}

// Constructor, defines a manager for animations.
//
// Members:
// - function play(set) : Adds the given animation set to be drawn.
// - function stop(set) : Removes the given animation set.
function AnimationManager() {
	var anims = [];

	this.play = function(set) {
		anims.push(set);
	};
	this.stop = function(set) {
		for (var i = 0; i < anims.length; i++) {
			if (anims[i] === set) {
				anims.splice(i, 1);
				return;
			}
		}
	};

	function Timer() {
		this.gameTime = 0;
		this.maxStep = 0.05;
		this.wallLastTimestamp = 0;

		this.tick = function() {
			var wallCurrent = Date.now();
			var wallDelta = (wallCurrent - this.wallLastTimestamp) / 1000;
			this.wallLastTimestamp = wallCurrent;

			var gameDelta = Math.min(wallDelta, this.maxStep);
			this.gameTime += gameDelta;
			return gameDelta;
		};
	}

	var timer = new Timer();
	(function render() {
		context.clearRect(0, 0, canvas.width, canvas.height);

		var dt = timer.tick();
		for (var i = 0; i < anims.length; i++) {
			anims[i].step(dt);
			anims[i].draw();
		}

    	window.requestAnimationFrame(render);
	})();
}

// jQuery function that is called once the page is loaded.
$(function() {
	canvas = document.getElementById("gameWorld");
	context = canvas.getContext("2d");
	animations = new AnimationManager();
});

