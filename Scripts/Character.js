/////////////////////////////////////////////////////////////////////
//
// Character.js - Defines the game characters.
//
// Load Dependencies - <none>
// Use  Dependencies - jQuery, Graphics, Assets.
//

// Defines the width/height of the character.
var CHARACTER_SIZE = 16;
// Contains the initial speed after a jump.
var JUMP_SPEED = 300;
// Contains the speed that players accellerate.
var FALL_SPEED = 750;
// Contains the max falling speed.
var MAX_FALL_SPEED = 10000;
// Contains the walking speed.
var WALK_SPEED = 75;
// Contains the sprinting factor.
var SPRINT_FACTOR = 2;

// Contains the key code for movement left.
var MOVE_LEFT = "A".charCodeAt(0);
// Contains the key code for movement right.
var MOVE_RIGHT = "D".charCodeAt(0);
// Contains the key code for jumping.
var MOVE_JUMP = " ".charCodeAt(0);
// Contains the key code for sprinting.
var MOVE_SPRINT = 16;

// Constructor, creates a new character object.
// - set : The animation sets for the character.
// - start : The map that defines the start position.
//
// Members:
// - function update(dt, map) : Updates the character information using the given delta-time.
// - function draw() : Draws the character on the screen.
// - function moveLeft() : Tells the character it should move left, must be called each update.
// - function moveRight() : Tells the character it should move right, must be called each update.
// - function sprint() : Tels the character it should sprint, must be called each update.
// - function jump() : Tels the character it should jump.
function Character(set, start) {
	var stoppedR = 0;
	var stoppedL = 1;
	var idleR = 2;
	var idleL = 3;
	var runningR = 4;
	var runningL = 5;
	var jumpingR = 6;
	var jumpingL = 7;
	var fallingR = 8;
	var fallingL = 9;

	set.switchTo(stoppedR);

	start = start || {};
	set.x = start.startX || 25;
	set.y = start.startY || 25;

	// Contains the velocity of the character.
	var xVel = 0;
	var yVel = 0; // Positive means upward movement.
	var dir = 0;  // 0 means looking right, 1 means left.
	var walks = false; // Whether the player is walking.
	var sprints = false; // Whether the player is sprinting.
	var canJump = false;

	var stopped = false;
	var stopTimer = 0;

	// Determines whether there is a solid block in the region (in pixels).
	function hitInRegion(map, minX, minY, maxX, maxY) {
		minX = Math.floor(minX / BLOCK_WIDTH);
		maxX = Math.floor(maxX / BLOCK_WIDTH);

		minY = Math.round(minY / BLOCK_WIDTH);
		maxY = Math.round(maxY / BLOCK_WIDTH);

		for (var i = minX; i <= maxX; i++) {
			for (var j = minY; j <= maxY; j++) {
				var r = map.isSolid(i, j);
				if (r) {
					if (r === 1) {
						ENGINE.killPlayer();
					} else if (r === 2) {
						ENGINE.endLevel();
					}

					return { x:(i * BLOCK_WIDTH), y:(j * BLOCK_WIDTH) };
				}
			}
		}
		return null;
	}
	// Stops the player and switches animations, called here also.
	function stop() {
		if (set.currentAnimation() >= runningR)
			set.switchTo(stoppedR + dir);

		xVel = 0;
		yVel = 0;
		if (!stopped)
			stopTimer = 5;
		stopped = true;
	};
	stop();

	this.update = function(dt, map) {
		set.step(dt);
		canJump = false;

		// Update the idle animation
		if (stopped) {
			stopTimer -= dt;
			if (stopTimer < 0) {
				set.smoothSwitch(idleR + dir);
			}
		}

		// Check for vertical blocks.
		{
			var dy = yVel*dt;
			var hit = false;
			if (yVel <= 0) {
				hit = hitInRegion(map, set.x + 10, set.y + set.height, set.x + set.width - 10, set.y + set.height - dy);

				// We are walking on a block, stop falling and walk.
				if (hit) {
					yVel = 0;
					set.y = hit.y - set.height;
					canJump = true;

					if (!walks && !stopped)
						stop();

					if (walks) {
						if (set.currentAnimation() != runningR + dir)
							set.switchTo(runningR + dir);
					}

				} else {
					// Otherwise we are falling.
					if (set.currentAnimation() <= runningL)
						set.switchTo(fallingR + dir);
				}
			} else {
				// Check for the ceiling.
				hit = hitInRegion(map, set.x + 10, set.y + dy, set.x + set.width - 10, set.y);

				// We hit the ceiling, stop rising.
				if (hit) {
					yVel = 0;
					set.y = hit.y + BLOCK_WIDTH;
					set.switchTo(fallingR + dir);
				}
			}
			if (!hit) {
				stopped = false;
				yVel -= FALL_SPEED * dt;
				if (yVel < -MAX_FALL_SPEED)
					yVel = -MAX_FALL_SPEED;
			}
		}

		// React to user input here so we know if we are on the ground.
		if (walks) {
			var max = -(2 * dir - 1) * WALK_SPEED;
			if (sprints)
				max *= SPRINT_FACTOR;

			var dv = (max - xVel);
			if (canJump || Math.abs(xVel) < Math.abs(max))
				xVel += 4 * dv * dt;
		}

		// Check for horizontal bocks.
		{
			var dx = xVel * dt;
			if (xVel > 0) {
				// We are moving to the right.
				var hit = hitInRegion(map, set.x + set.width, set.y + 10, set.x + set.width + dx, set.y + set.height - 10);

				if (hit) {
					xVel = 0;
					set.x = hit.x - set.width;
				}
			} else if (xVel < 0) {
				// We are moving to the left.
				var hit = hitInRegion(map, set.x - dx, set.y + 10, set.x, set.y + set.height - 10);

				if (hit) {
					xVel = 0;
					set.x = hit.x + BLOCK_WIDTH;
				}
			}
		}

		// Use the new values of velocity to move the player.
		set.x += xVel * dt;
		set.y -= yVel * dt;
		walks = false;
		sprints = false;

		this.x = set.x;
		this.y = set.y;
	};
	this.draw = function(x, y) {
		set.x -= x;
		set.y -= y;
		set.draw();
		set.x += x;
		set.y += y;
	};

	this.moveLeft = function() {
		walks = true;
		stopped = false;
		dir = 1;
	};
	this.moveRight = function() {
		walks = true;
		stopped = false;
		dir = 0;
	};
	this.jump = function() {
		if (canJump) {
			yVel = JUMP_SPEED;
			set.switchTo(jumpingR + dir);
		}
	};
	this.sprint = function() {
		sprints = true;
	};
}

// Constructor, defines a character that responds to user input.
// - c : The character object this wraps.
//
// Members:
// - function update(dt, map) : Updates the character information using the given delta-time.
// - function draw() : Draws the character on the screen.
function PlayerCharacter(c) {
	var keys = [];
	var shift = false;

	this.update = function(dt, map) {
		if (keys[MOVE_LEFT] && !keys[MOVE_RIGHT])
			c.moveLeft();
		else if (keys[MOVE_RIGHT] && !keys[MOVE_LEFT])
			c.moveRight();

		if (keys[MOVE_JUMP])
			c.jump();
		if (keys[MOVE_SPRINT])
			c.sprint();

		c.update(dt, map);

		this.x = c.x;
		this.y = c.y;
	};
	this.draw = function(x, y) {
		c.draw(x, y);
	};

	// Detach old key listeners.
	$(document).off(".char");

	// Attach key listeners.
	function keydown(e) {
        keys[e.which] = (keys[e.which] || 0) + 1;

        return false; // http://stackoverflow.com/questions/1357118/event-preventdefault-vs-return-false
	}
	function keyup(e) {
        keys[e.which] = 0;

        return false;
	}
    $(document).on("keydown.char", keydown);
    $(document).on("keyup.char", keyup);
}

// Creates a new PlayerCharacter of the given index.
// - i : Index of the character: Dain, Mike, Brandon, Jacob
function CreatePlayerCharacter(i, map) {
	switch (i) {
		case 0: i = 3; break;
		case 1: i = 0; break;
		case 2: i = 2; break;
		case 3: i = 1; break;
	}
	i = 9*i + 1; // Mike, Jacob, Brandon, Dain.

    var img = ASSETS["us"];
    var frames = SimpleFrames(img.width, img.height, 72, 9, 8);
    var sheet = new SpriteSheet(img, frames);

    var padding = new Padding(0, 0, 0, 2); //new Padding(3, 5, 3, 5);
    var stoppedR = new StillAnimation(sheet, i-1, padding);
    var stoppedL = new StillAnimation(sheet, i-1, padding, true);
    var idleR = new StillAnimation(sheet, i-1, padding);
    var idleL = new StillAnimation(sheet, i-1, padding, true);
    var runningR = new Animation(sheet, i, 8, 0.1, padding, true);
    var runningL = new Animation(sheet, i, 8, 0.1, padding, true, false, false, true);
    var jumpingR = new Animation(sheet, i+36, 4, 0.1, padding, true);
    var jumpingL = new Animation(sheet, i+36, 4, 0.1, padding, true, false, false, true);
    var fallingR = new Animation(sheet, i+36, 4, 0.1, padding, true);
    var fallingL = new Animation(sheet, i+36, 4, 0.1, padding, true, false, false, true);

    var set = new AnimationSet(stoppedR, stoppedL, idleR, idleL, runningR, runningL, jumpingR, jumpingL, fallingR, fallingL);
    var ch = new Character(set, map);

    return new PlayerCharacter(ch);
}