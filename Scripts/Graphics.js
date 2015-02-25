/////////////////////////////////////////////////////////////////////
//
// Graphics.js - Defines graphics components for the game.
//
// Load Dependencies - jQuery
// Use  Dependencies - <none>
//

// Example animation usage:
(function() {
	// Get an img asset from the assets.
	var img = ASSETS["us"];
	// Create the frame info for the image.
    var frames = SimpleFrames(img.width, img.height, 36, 9, 4);
    // Create a sprite sheet that allows rendering part of an image.
    var sheet = new SpriteSheet(img, frames);
    // Create an animation that defines a sequence of frames to draw.
    var anim = new Animation(sheet, 1, 8, 0.1, true);
    // Create an animation set that holds all the animations for an object.
    var set = new AnimationSet(anim);

    // Register the animation set to the animation manager.
    ANIMATIONS.play(set);
});

var CANVAS = null;
var CONTEXT = null;
var ANIMATIONS = null;

window.requestAnimFrame = (window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
                window.setTimeout(callback, 1000 / 60);
            });
CanvasRenderingContext2D.prototype.dashedLine = function (x1, y1, x2, y2, dashLen) {
    if (dashLen === undefined) dashLen = 2;
    this.moveTo(x1, y1);

    var dX = x2 - x1;
    var dY = y2 - y1;
    var dashes = Math.floor(Math.sqrt(dX * dX + dY * dY) / dashLen);
    var dashX = dX / dashes;
    var dashY = dY / dashes;

    var q = 0;
    while (q++ < dashes) {
        x1 += dashX;
        y1 += dashY;
        this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x1, y1);
    }
    this[q % 2 == 0 ? 'moveTo' : 'lineTo'](x2, y2);
};

// Helper function that returns the max element using the given selector.
// - data : The input array to search.
// - func : The selector function.
function MaxSel(data, func) {
	func = func || function(data) { return data; };
	if (!data || data.length === 0) {
		return;
	}

	var reti = 0;
	var ret = func(data[0]);
	for (var i = 1; i < data.length; i++) {
		var d = func(data[i]);
		if (ret < d) {
			reti = i;
			ret = d;
		}
	}

	return data[reti];
}

// Constructor, defines a rectangle.
// - left : The x-position of the left.
// - top : The y-position of the top.
// - right : The x-position of the right.
// - bottom : The y-position of the bottom.
function Rect(left, top, right, bottom) {
	this.left = left || 0;
	this.top = top || 0;
	this.right = right || 0;
	this.bottom = bottom || 0;

	this.flip = function(flipH, flipV) {
		var l = this.left;
		var r = this.right;
		var t = this.top;
		var b = this.bottom;

		if (flipH) {
			var temp = l;
			l = r;
			r = temp;
		}
		if (flipV) {
			var temp = t;
			t = b;
			b = temp;
		}

		return new Rect(l, t, r, b);
	};
}

// Constructor, defines a frame in the SpriteSheet.
// - x : The x-position of the frame.
// - y : The y-position of the frame.
// - width : The width the frame.
// - height : The height of the frame.
// - offsetX : The x-offset of the frame from the base.
// - offsetY : The y-offset of the frame from the base.
function Frame(x, y, width, height, offsetX, offsetY) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.offsetX = offsetX || 0;
	this.offsetY = offsetY || 0;

	this.draw = function(img, ctx, x, y, w, h, clip) {
		clip = clip || new Rect();

		ctx.drawImage(
			img, 
			this.x + clip.left + 1 - (1 / SCALE), 
			this.y + clip.top + 1 - (1 / SCALE),
			this.width - clip.left - clip.right - 1 + (1 / SCALE), 
			this.height - clip.top - clip.bottom - 1 + (1 / SCALE),
			x + this.offsetX + clip.left - 1 + (1 / SCALE), 
			y + this.offsetY + clip.top - 1 + (1 / SCALE),
			(this.width - clip.left) * w - clip.right + 1 - (1 / SCALE), 
			(this.height - clip.top) * h - clip.bottom + 1 - (1 / SCALE));

		if (DEBUG) {
			ctx.beginPath();
			ctx.lineWidth = "1";
			ctx.strokeStyle = "red";
			ctx.rect(x + this.offsetX, y + this.offsetY, this.width * w, this.height); 
			ctx.stroke();
		}
	};
}

// Creates an array of frames using the given arguments.
// - count : the number of frames in the image.
// - widthCount : The number of frames wide.
// - heightCount : The number of frames high.
// - frameWidth : The width of a frame.
// - frameHeight : The height of a frame.
// - offsetWidth : The x offest of the start.
// - offsetHeight : The y offest of the start.
function SimpleFrames(width, height, count, widthCount, heightCount, sepWidth, sepHeight, offsetWidth, offsetHeight, frameWidth, frameHeight) {
	offsetWidth = offsetWidth || 0;
	offsetHeight = offsetHeight || 0;
	sepWidth = sepWidth || 0;
	sepHeight = sepHeight || 0;
	frameWidth = frameWidth || ((width - offsetWidth - sepWidth * (widthCount - 1)) / widthCount);
	frameHeight = frameHeight || ((height - offsetHeight- sepHeight * (heightCount - 1)) / heightCount);

	var frames = [];
	for (var i = 0; i < count; i++) {
		var frameX = Math.floor(i % widthCount);
		var frameY = Math.floor(i / widthCount);

		frames[i] = new Frame((frameWidth + sepWidth) * frameX + offsetWidth, (frameHeight + sepHeight) * frameY + offsetHeight,
				frameWidth, frameHeight);
	}

	return frames;
}

// Function that creates a frames array by repeated calls.
// - x : The x-position of the frame.
// - y : The y-position of the frame.
// - width : The width the frame.
// - height : The height of the frame.
// - offsetX : The x-offset of the frame from the base.
// - offsetY : The y-offset of the frame from the base.
//
// Usage: ComplexFrames(...)(...)(...) ... (...).create();
function ComplexFrames(x, y, width, height, offsetX, offsetY) {
	var frames = [];

	var ret = function(x, y, width, height, offsetX, offsetY) {
		frames.push(new Frame(x, y, width, height, offsetX, offsetY));
		return ret;
	};
	ret.create = function() {
		return frames;
	};

	return ret(x, y, width, height, offsetX, offsetY);
}

// Constructor, defines a SpriteSheet wrapper for an image.
// - img : The <img> tag that contins the image.
// - frames : An array of Frame objects.
// - frameWidth : The width of a frame.
// - frameHeight : The height of a frame.
//
// Members:
// - width : The width of the image to draw.
// - height : The height of the image to draw.
// - this[i] : Gets the frame with the given index with the given members.
//      - function draw() : Draws the frame to the canvas.
function SpriteSheet(img, frames) {
	var sheet = this;
	this.width = MaxSel(frames, function(d) { return d.width; }).width;
	this.height = MaxSel(frames, function(d) { return d.height; }).height;

	function SheetItem(index) {
		this.width = frames[index].width;
		this.height = frames[index].height;

		this.draw = function(x, y, w, h, flipH, flipV, ctx, clip) {
			w = w || 1;
			h = h || 1;
			ctx = ctx || CONTEXT;
			clip = clip || new Rect();

			// If flipping, modify the context.
			if (flipH || flipV) {
				ctx.save();

				var tw = 0;
				var th = 0;
				var sx = 1;
				var sy = 1;
				if (flipH) {
					tw = this.width;
					sx = -1;
					x *= -1;
				}
				if (flipV) {
					th = this.height;
					sy = -1;
					y *= -1;
				}

				ctx.translate(tw, th);
				ctx.scale(sx, sy);
			}

			frames[index].draw(img.img, ctx, x, y, w, h, clip.flip(flipH, flipV));

			// Restore the context state.
			if (flipH || flipV)
				ctx.restore();

			return this;
		};
	};

	for (var i = 0; i < frames.length; i++) {
		this[i] = new SheetItem(i);
	}
}

// Constructor, defines padding used in the animation.
// - left : The padding on the left of the animation.
// - top : The padding on the top of the animation.
// - right : The padding on the right of the animation.
// - bottom : The padding on the bottom of the animation.
function Padding(left, top, right, bottom) {
	this.left = left || 0;
	this.top = top || 0;
	this.right = right || 0;
	this.bottom = bottom || 0;
}

// Constructor, defines an Animation that controls an animation on a SpriteSheet.
// - sheet : The SpriteSheet that holds the image.
// - start : The start index of the animation in the sprite sheet.
// - count : The number of frames in the animation.
// - time : The time between frames (in sec).
// - padding : The padding of whitespace in the animation.
// - loopIndex : The index to continue looping from; true to loop from the beginning; otherwise don't loop.
// - reverse : Whether the animation should be reversed.
// - bothDir : Whether the animation should play forward then reverse, ignores reverse.
// - flipHoriz : Whether to flip the image horizontaly.
// - flipVert : Whether to flip the image verticaly.
//
// Members:
// - width : The width of the animation, this is not used.
// - height : The height of the animation, this is not used.
// - function draw(x, y) : Draws the current image at the given coords.
// - function step(dt) : Updates the current frame with the given delta-time.
// - function reset() : Resets the current animation position.
// - function start() : Sets the animation to playing.
// - function stop() : Sets the animation to idle.
function Animation(sheet, start, count, time, padding, loopIndex, reverse, bothDir, flipHoriz, flipVert) {
	var elapsed = 0;
	var running = true;
	var firstLoop = true;
	var oldStart = start;
	var loop = (loopIndex || loopIndex === 0);
	if (loopIndex === true)
		loopIndex = start;
	padding = padding || new Padding();

	function frameCount() {
		if (bothDir) return 2 * count - 2;
		else return count;
	}

	this.width = sheet.width;
	this.height = sheet.height;

	this.draw = function(x, y, w, h, clip) {
		if (running) {
			// Get the current index from the time.
			var index = Math.floor(elapsed / time);
			if (reverse)
				index = (count - index - 1);
			if (index >= count)
				index = 2 * count - index - 2;
			index += start;

			// Draw the current frame.
			var ret = sheet[index].draw(x - padding.left, y - padding.top, w, h, flipHoriz, flipVert, null, clip);

			// Update the width/height.
			this.width = ret.width - padding.left - padding.right;
			this.height = ret.height - padding.bottom - padding.top;
			return this;
		}
	};
	this.step = function(dt) {
		elapsed += dt;
		if (elapsed >= time * frameCount()) {
			elapsed = 0;
			if (!loop) 
				running = false;
			else if (firstLoop) {
				firstLoop = false;
				count -= (loopIndex - start);
				start = loopIndex;
			}

			return true;
		}

		return false;
	};
	this.reset = function() {
		elapsed = 0;
		start = oldStart;
		if (loop)
			count += (loopIndex - start);
	};
	this.start = function() {
		elapsed = 0;
		running = true;
	};
	this.stop = function() {
		running = false;
	};
}

// Constructor, defines a still Animation that controls an animation on a SpriteSheet.
// - sheet : The SpriteSheet that holds the image.
// - start : The start index of the animation in the sprite sheet.
// - flipHoriz : Whether to flip the image horizontaly.
// - flipVert : Whether to flip the image verticaly.
//
// Members:
// - width : The width of the animation, this is not used.
// - height : The height of the animation, this is not used.
// - function draw(x, y) : Draws the current image at the given coords.
// - function step(dt) : Updates the current frame with the given delta-time, does nothing.
// - function reset() : Resets the current animation position, does nothing.
// - function start() : Sets the animation to playing, does nothing.
// - function stop() : Sets the animation to idle, does nothing.
function StillAnimation(sheet, start, padding, flipHoriz, flipVert) {
	padding = padding || new Padding();

	this.width = sheet.width;
	this.height = sheet.height;

	this.draw = function(x, y, w, h, clip) {
		// Draw the current frame.
		var ret = sheet[start].draw(x - padding.left, y - padding.top, w, h, flipHoriz, flipVert, null, clip);

		// Update the width/height.
		this.width = ret.width - padding.left - padding.right;
		this.height = ret.height - padding.top - padding.bottom;
		return this;
	};
	this.step = function(dt) {
		return true;
	};
	this.reset = this.start = this.stop = function() { };
}

// Constructor, defines a set of animations for a sprite sheet.
// - *Accepts a variable number of arguments.
//
// Members:
// - x : The current x position.
// - y : The current y position.
// - width : The width of the animation set, readonly.
// - height : The height of the animation set, readonly.
// - scaleX : The factor to scale the width.
// - scaleY : The factor to scale the height.
// - function draw() : Draws the current animation.
// - function step(dx) : Updates the current frame with the given delta-time.
// - function switchTo(i) : Switches the current animation to the given index.
// - function smoothSwitch(i) : Switches the current animation smoothly.
// - function clone() : Creates a copy of the current AnimationSet.
// - function curentAnimation() : Gets the current animation number.
function AnimationSet() {
	var anims = arguments;
	var curAnim = 0;
	var switchAnim = null;

	this.x = 0;
	this.y = 0;
	this.width = MaxSel(arguments, function(d) { return d.width; }).width || 0;
	this.height = MaxSel(arguments, function(d) { return d.height; }).height || 0;

	this.scaleX = 1;
	this.scaleY = 1;
	this.clip = null;

	this.draw = function() {
		var ret = anims[curAnim].draw(this.x, this.y, this.scaleX, this.scaleY, this.clip);

		this.width = ret.width;
		this.height = ret.height;
	};
	this.step = function(dx) {
		if (anims[curAnim].step(dx) && switchAnim != null) {
			curAnim = switchAnim;
			switchAnim = null;

			anims[curAnim].reset();
			anims[curAnim].start();
		}
	};
	this.switchTo = function(i) {
		curAnim = i;
		switchAnim = null;
		anims[i].reset();
		anims[i].start();
	};
	this.smoothSwitch = function(i) {
		switchAnim = i;
	};
	this.currentAnimation = function() {
		return curAnim;
	};
	this.clone = function() {
		return new AnimationSet(anims);
	};
}

// jQuery function that is called once the page is loaded.
$(function() {
	CANVAS = document.getElementById("gameWorld");
	CONTEXT = CANVAS.getContext("2d");
	CONTEXT.imageSmoothingEnabled = false;

	CANVAS.width *= SCALE;
	CANVAS.height *= SCALE;
	CONTEXT.scale(SCALE, SCALE);
});