/////////////////////////////////////////////////////////////////////
//
// Character.js - Defines the game characters.
//
// Load Dependencies - <none>
// Use  Dependencies - jQuery, Graphics, Assets.
//

// Defines the width/height of the character.
var CHARACTER_SIZE = 32;
// Contains the initial speed after a jump.
var JUMP_SPEED = 300;
// Contains the speed that players accellerate.
var FALL_SPEED = 750;
// Contains the max falling speed.
var MAX_FALL_SPEED = 1000;
// Contains the walking speed.
var WALK_SPEED = 75;
// Contains the sprinting factor.
var SPRINT_FACTOR = 2;

// Contains the key code for movement left.
var MOVE_LEFT = "A".charCodeAt(0);
var MOVE_LEFT2 = 37; // Left-arrow
// Contains the key code for movement right.
var MOVE_RIGHT = "D".charCodeAt(0);
var MOVE_RIGHT2 = 39; // Right-arrow
// Contains the key code for jumping.
var MOVE_JUMP = " ".charCodeAt(0);
// Contains the key code for sprinting.
var MOVE_SPRINT = 16; // Shift

// Constructor, creates a new character object.
// - set : The animation sets for the character.
// - x : The x-position to start at.
// - y : The y-position to start at.
//
// Members:
// - function update(dt, map) : Updates the character information using the given delta-time.
// - function draw() : Draws the character on the screen.
// - function moveLeft() : Tells the character it should move left, must be called each update.
// - function moveRight() : Tells the character it should move right, must be called each update.
// - function sprint() : Tels the character it should sprint, must be called each update.
// - function jump() : Tels the character it should jump.
function Character(set, x, y) {
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

	set.x = x || 25;
	set.y = y || 25;

	// Contains the velocity of the character.
	var xVel = 0;
	var yVel = 0; // Positive means upward movement.
	var dir = 0;  // 0 means looking right, 1 means left.
	var walks = false; // Whether the player is walking.
	var sprints = false; // Whether the player is sprinting.
	var canJump = false;
	var hitP = null;

	var stopped = false;
	var stopTimer = 0;
	var that = this;

	this.x = set.x;
	this.y = set.y;
	this.width = set.width;
	this.height = set.height;

	// Determines whether there is a solid block in the region (in pixels).
	function hitInRegion(map, minX, minY, maxX, maxY) {
		minX = Math.floor(minX / BLOCK_WIDTH);
		maxX = Math.floor((maxX +5) / BLOCK_WIDTH);

		minY = Math.floor(minY / BLOCK_WIDTH);
		maxY = Math.floor(maxY / BLOCK_WIDTH);

		for (var i = minX; i <= maxX; i++) {
			for (var j = minY; j <= maxY; j++) {
				var r = map.getBlock(i, j);
				if (r === 5)
					that.kill();
				else if (r === 3)
					that.endLevel();
				else if (r === 2)
					that.clearPortals();

				if (!r) {
					return { x: (i * BLOCK_WIDTH), y: (j * BLOCK_WIDTH) };
				}
			}
		}
		return null;
	}
	// A helper for determining player-cube collision
	function hitBox(minB0, maxB0, minB1, maxB1, x0, x1, dx) {
		if (maxB1 < minB0 || minB1 > maxB0) return null;

		if (dx > 0)
			return (x0 < x1 && (x0 + dx) > x1) ? { x:x0, y:x0 } : null;
		else
			return (x0 < x1 && (x0 - dx) > x1) ? { x:x1, y:x1 } : null;
	}
	// Stops the player and switches animations, called here also.
	this.stop = function() {
		if (set.currentAnimation() >= runningR)
			set.switchTo(stoppedR + dir);

		xVel = 0;
		yVel = 0;
		if (!stopped)
			stopTimer = 5;
		stopped = true;
	};
	this.stop();

	this.update = function(dt, map, portal1, portal2, other) {
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
		hitP = HitPortal(portal1, portal2, set, xVel * dt, yVel * dt);
		{
			var dy = yVel*dt;
			var hit = false;
			if (!hitP || !hitP.near.horiz) {
				if (yVel <= 0) {
					hit = hitInRegion(map, set.x + 10, set.y + set.height, set.x + set.width - 10, set.y + set.height - dy) ||
						  (other && hitBox(set.x, set.x + set.width, other.x, other.x + other.width, set.y + set.height - 2, other.y, dy - 5));

					// We are walking on a block, stop falling and walk.
					if (hit) {
						yVel = 0;
						set.y = hit.y - set.height;
						canJump = true;

						if (!walks && !stopped)
							this.stop();

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
					hit = ((!hitP || !hitP.near.horix) && hitInRegion(map, set.x + 10, set.y + dy, set.x + set.width - 10, set.y)) ||
						  (other && hitBox(set.x, set.x + set.width, other.x, other.x + other.width, other.y + other.height - BLOCK_WIDTH, set.y - BLOCK_WIDTH, dy));

					// We hit the ceiling, stop rising.
					if (hit && !hitP) {
						yVel = 0;
						set.y = hit.y + BLOCK_WIDTH;
						set.switchTo(fallingR + dir);
					}
				}
			}
			if (!hit || (hitP && hitP.near.horiz)) {
				stopped = false;
				yVel -= FALL_SPEED * dt;
				if (yVel < -MAX_FALL_SPEED)
					yVel = -MAX_FALL_SPEED;
			}
		}

		// React to user input here so we know if we are on the ground.
		if (!hitP || !hitP.near.horiz) {
			var max = -(2 * dir - 1) * WALK_SPEED * walks;
			if (sprints)
				max *= SPRINT_FACTOR;

			var dv = (max - xVel);
			if (canJump || Math.abs(xVel) < Math.abs(max))
				xVel += 4 * dv * dt;
		}

		// Check for horizontal bocks.
		{
			var dx = xVel * dt;
			if (!hitP || hitP.near.horiz) {
				if (xVel > 0) {
					// We are moving to the right.
					var hit = hitInRegion(map, set.x + set.width, set.y + 10, set.x + set.width + dx, set.y + set.height - 10) ||
							  (other && hitBox(set.y, set.y + set.height, other.y, other.y + other.height, this.x + this.width, other.x, dx));

					if (hit) {
						xVel = 0;
						set.x = hit.x - set.width;
					}
				} else if (xVel < 0) {
					// We are moving to the left.
					var hit = hitInRegion(map, set.x - dx, set.y + 10, set.x, set.y + set.height - 10) ||
							  (other && hitBox(set.y, set.y + set.height, other.y, other.y + other.height, other.x + other.width - BLOCK_WIDTH, this.x - BLOCK_WIDTH, dx));

					if (hit) {
						xVel = 0;
						set.x = hit.x + BLOCK_WIDTH;
					}
				}
			}
		}

		// Update the position for the portal.
		if (hitP) {
			// If the player is past the center of the portal, move to the other location.
			if (hitP.dist <= 0) {
				// If the portals are different directions, swap x and y velocities.
				if (hitP.near.horiz != hitP.far.horiz) {
					var t = xVel;
					xVel = yVel;
					yVel = t;
				}
				if (hitP.near.top == hitP.far.top) {
					if (hitP.far.horiz)
						yVel = -yVel;
					else
						xVel = -xVel;
				}

				if (hitP.far.horiz) {
					set.x = hitP.far.x - set.width / 2;
					if (!hitP.far.top)
						set.y = hitP.far.y;
					else
						set.y = hitP.far.y - set.height;
				} else {
					set.y = hitP.far.y - set.height / 2;
					if (hitP.far.top)
						set.x = hitP.far.x;
					else
						set.x = hitP.far.x - set.width;
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
		this.width = set.width;
		this.height = set.height;

        if (set.x < -15 || set.y < -15 || set.x > map.width + 15 || set.y > map.height + 15) this.kill();
	};
	this.draw = function(dx, dy, portal1, portal2) {
		function drawPart(port, dist, x, y) {
			var clip = 
			!port ? null : 
				new Rect(
					(port.top && !port.horiz ? dist : 0),
					(!port.top && port.horiz ? dist : 0),
					(!port.top && !port.horiz ? dist : 0),
					(port.top && port.horiz ? dist : 0));

			var oldx = set.x;
			var oldy = set.y;

			set.clip = clip;
			set.x = (x === undefined ? set.x : x);
			set.y = (y === undefined ? set.y : y);

			set.draw();

			set.x = oldx;
			set.y = oldy;
		}

		var hit = HitPortal(portal1, portal2, set);

		if (!hit) {
			drawPart();
		} else {
			if (hit.near.horiz) 
				drawPart(hit.near, set.height - hit.dist - (hit.near.top ? BLOCK_WIDTH : 0));
			else
				drawPart(hit.near, set.width - hit.dist);

			var x, y;
			if (hit.far.horiz) {
				x = hit.far.x - set.width / 2;
				if (!hit.far.top)
					y = hit.far.y - hit.dist;
				else
					y = hit.far.y + hit.dist - set.height;
			} else {
				y = hit.far.y - set.height / 2;
				if (hit.far.top)
					x = hit.far.x - hit.dist;
				else
					x = hit.far.x + hit.dist - set.width;
			}
			drawPart(hit.far, hit.dist, x, y);
		}
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
			ASSETS["jump"].audio.play();
			ASSETS["jump"].audio.currentTime = 0.25;

			yVel = JUMP_SPEED;
			set.switchTo(jumpingR + dir);
		}
	};
	this.sprint = function() {
		sprints = true;
	};
}

// Constructor, defines a portal a player can pass through.
// - x : The x-position of the center of the portal.
// - y : The y-position of the center of the portal.
// - horiz : Whether the portal is horizontal.
// - top : Whether the portal is on the top/right.
function Portal(x, y, horiz, top) {
	this.x = x;
	this.y = y;
	this.horiz = horiz;
	this.top = top;
}
// Determines if a character has hit one of the portals.
function HitPortal(portal1, portal2, ch, dx, dy) {
	function HitPartial(portal, far) {
		var top = ch.y;
		var bottom = ch.y + ch.height;
		var left = ch.x;
		var right = ch.x + ch.width;

		var pad = 5;
		var minX, minY, maxX, maxY, dist;
		if (portal.horiz) {
			if (portal.top) { // Top
				minY = top - pad;
				maxY = bottom - dy;
				dist = portal.y - top - BLOCK_WIDTH + dy;
			} else { // Bottom
				minY = top - dy;
				maxY = bottom + pad;
				dist = bottom - portal.y - dy;
			}

			minX = ch.x + ch.width / 2 - pad;
			maxX = ch.x + ch.width / 2 + pad;
		} else {
			if (portal.top) { // Right
				minX = left + dx;
				maxX = right + pad;
				dist = right - portal.x + dx;
			} else { // Left
				minX = left - pad;
				maxX = right + dx;
				dist = portal.x - left - dx;
			}

			minY = ch.y + ch.height / 2 - pad;
			maxY = ch.y + ch.height / 2 + pad;
		}

		if (maxY >= portal.y && minY <= portal.y && maxX >= portal.x && minX <= portal.x) {
			return { near: portal, far: far, dist: dist };
		}
		else
			return null;
	}

	dx = dx || 0;
	dy = dy || 0;

	if (!portal1 || !portal2)
		return null;
	else {
		var a = HitPartial(portal1, portal2);
		var b = HitPartial(portal2, portal1);

		if (a && b)
			return (a.dist > b.dist ? a : b);
		else
			return a || b;
	}
}

// Constructor, defines a companion cube character.
// - x : The x-position to start at.
// - y : The y-position to start at.
//
// Members:
// - function update(dt, map) : Updates the character information using the given delta-time.
// - function draw() : Draws the character on the screen.
function CubeCharacter(x, y) {
	var cube = (function() {
		var img = ASSETS["level"];
        var frames = SimpleFrames(img.width, img.height, 64, 8, 8);
        var sheet = new SpriteSheet(img, frames);
        var anim = new StillAnimation(sheet, 36);
        return new AnimationSet(anim);
	})();
	Character.call(this, cube, x, y);

	this.clearPortals = function() {};
	this.endLevel = function() {};
	this.kill = function() {
		cube.x = x;
		cube.y = y;
	};
	this.kill();
}

// Constructor, defines a character that responds to user input.
// - c : The character object this wraps.
// - cube : The character object for the cube.
//
// Members:
// - function update(dt, map) : Updates the character information using the given delta-time.
// - function draw() : Draws the character on the screen.
function PlayerCharacter(set, map, cube) {
	Character.call(this, set, map.startX, map.startY);

	var portals = (function() {
		var img = ASSETS["us"];
	    var frames = SimpleFrames(img.width, img.height, 22, 11, 2, 0, 0, 0, 355);
    	var sheet = new SpriteSheet(img, frames);

    	var p1 = new Animation(sheet, 0, 10, 0.1, new Padding(0, 0, 0, 1), true);
    	var p2 = new Animation(sheet, 11, 10, 0.1, null, true);
    	return [p1, p2];
	})();
	var mouse = { };
	var oldMap = map;
	var keys = [];
	var shift = false;
	var port1 = null;
	var port2 = null;
	var that = this;

	var oldDraw = this.draw;
	var oldUpdate = this.update;

	function rayTrace(x0, y0, x1, y1, func) {
		x0 /= BLOCK_WIDTH;
		x1 /= BLOCK_WIDTH;
		y0 /= BLOCK_WIDTH;
		y1 /= BLOCK_WIDTH;

		var dx = Math.abs(x1 - x0);
		var dy = Math.abs(y1 - y0);
		var x = Math.floor(x0);
		var y = Math.floor(y0);

		var x_inc, y_inc;
		var error;

		if (dx == 0) {
			x_inc = 0;
			error = Infinity;
		} else if (x1 > x0) {
			x_inc = 1;
			error = (Math.floor(x0) + 1 - x0) * dy;
		} else {
			x_inc = -1;
			error = (x0 - Math.floor(x0)) * dy;
		}

		if (dy == 0) {
			y_inc = 0;
			error -= Infinity;
		} else if (y1 > y0) {
			y_inc = 1;
			error -= (Math.floor(y0) + 1 - y0) * dx;
		} else {
			y_inc = -1;
			error -= (y0 - Math.floor(y0)) * dx;
		}

		var top = true, horiz = true;
		for (;;) {
			if (func(x, y, horiz, top)) return;

			if (error > 0) {
				y += y_inc;
				error -= dx;

				horiz = true;
				top = (y_inc > 0);
			} else {
				x += x_inc;
				error += dy;

				horiz = false;
				top = (x_inc < 0);
			}
		}
	}
    function updateMouse() {
		var x0 = that.x + that.width / 2;
		var dx = mouse.rx + mouse.dx - x0;
		var x1 = x0 + dx;
		var y0 = that.y + that.height / 2;
		var dy = mouse.ry + mouse.dy - y0;
		var y1 = y0 + dy;
		var m = dy / dx;
		rayTrace(x0, y0, x1, y1, function(x, y, horiz, top) {
			var r = oldMap.getBlock(x, y);
			if (!r || r === 2) {
				if (horiz) {
					mouse.y = y*BLOCK_WIDTH + (!top ? BLOCK_WIDTH : 0);
					mouse.x = (mouse.y - y0) / m + x0;
				} else {
					mouse.x = x*BLOCK_WIDTH + (top ? BLOCK_WIDTH : 0);
					if (isFinite(m))
						mouse.y = m*(mouse.x - x0) + y0;
					// There is no way to get the y position if pointing up
					// however this shouldn't happen, so ignore.
				}
				mouse.horiz = horiz;
				mouse.top = top;

				return true;
			}
		});
    }

    this.kill = function() {
    	ENGINE.killPlayer();
    };
    this.endLevel = function() {
    	ENGINE.endLevel();
    };
    this.clearPortals = function() {
    	port1 = port2 = null;
    };

	this.update = function(dt, map) {
		map.checkButtons(this, cube);

		oldMap = map;
		if ((keys[MOVE_LEFT] || keys[MOVE_LEFT2]) && !(keys[MOVE_RIGHT] || keys[MOVE_RIGHT2]))
			this.moveLeft();
		else if ((keys[MOVE_RIGHT] || keys[MOVE_RIGHT2]) && !(keys[MOVE_LEFT] || keys[MOVE_LEFT2]))
			this.moveRight();

		if (keys[MOVE_JUMP])
			this.jump();
		if (keys[MOVE_SPRINT])
			this.sprint();

		oldUpdate.call(this, dt, map, port1, port2, cube);
		if (cube)
			cube.update(dt, map, port1, port2, this);

		portals[0].step(dt);
		portals[1].step(dt);

		updateMouse();
	};
	this.draw = function(dx, dy) {
		function DrawPortal(port, asset) {
			CONTEXT.save();
			if (port.horiz) {
				var x = port.x - asset.width / 2;
				var y = port.y;

				CONTEXT.translate(x, y);
			} else {
				var x = port.x;
				var y = port.y - asset.width / 2;

				CONTEXT.translate(x, y);
				CONTEXT.rotate(90 * Math.PI / 180);
			}
			if (!port.top) {
				CONTEXT.scale(1, -1);
			}
			CONTEXT.translate(0, -asset.height);

			asset.draw(0, 0);

			CONTEXT.restore();
		};

		if (port1)
			DrawPortal(port1, portals[0]);
		if (port2)
			DrawPortal(port2, portals[1]);

		// Draw the portal path line.
		CONTEXT.save();
		CONTEXT.beginPath();
		CONTEXT.lineWidth = "1";
		if (mouse.shift)
			CONTEXT.strokeStyle = "#E17A74";
		else
			CONTEXT.strokeStyle = "#00CCFF";
	    CONTEXT.dashedLine(this.x + this.width / 2, this.y + this.height / 2, mouse.x, mouse.y, 3);
	    CONTEXT.stroke();
	    // Draw portal circle
	    CONTEXT.beginPath();
    	CONTEXT.arc(mouse.x, mouse.y, 3, 0, 2 * Math.PI, false);
    	CONTEXT.stroke();
    	CONTEXT.restore();

		oldDraw.call(this, 0, 0, port1, port2);
		if (cube)
			cube.draw(0, 0, port1, port2);

		mouse.dx = dx;
		mouse.dy = dy;
	};

	// Detach old key listeners.
	this.detach = function() {
		$(document).off(".char");
	};
	this.detach();

	// Attach key listeners.
	this.attach = function() {
		$(document).on("keydown.char", function(e) {
	        keys[e.which] = (keys[e.which] || 0) + 1;
	        mouse.shift = e.shiftKey;

	        return false; // http://stackoverflow.com/questions/1357118/event-preventdefault-vs-return-false
		});
		$(document).on("keyup.char", function(e) {
	        keys[e.which] = 0;
	        mouse.shift = e.shiftKey;

	        return false;
		});
		$(document).on("mousedown.char", function(e) {
			function valid(x, y, dx, dy) {
				return (oldMap.getBlock(x, y) === undefined &&
						(oldMap.getBlock(x - dx, y + dy) === 1 || oldMap.getBlock(x - dx, y + dy) === 3));
			}
			updateMouse();
			ASSETS["portal"].audio.play();
			ASSETS["portal"].audio.currentTime = 0;

			var port;
			var x = Math.floor(mouse.x / BLOCK_WIDTH) - (!mouse.top || mouse.horiz ? 0 : 1);
			var y = Math.floor(mouse.y / BLOCK_WIDTH) - (mouse.top || !mouse.horiz ? 0 : 1);
			var d = (mouse.top ? -1 : 1);
			if (mouse.horiz) {
				if (valid(x, y, 0, d)) {
					if (!valid(x - 1, y, 0, d)) {d
						// If the block to the left isn't solid, move to the right.
						if (valid(x + 1, y, 0, d))
							port = new Portal((x + 1) * BLOCK_WIDTH, mouse.y, mouse.horiz, mouse.top);
					} else if (!valid(x + 1, y, 0, d)) {
						// If the block to the right isn't solid, move to the left.
						port = new Portal(x * BLOCK_WIDTH, mouse.y, mouse.horiz, mouse.top);
					} else {
						port = new Portal(mouse.x, mouse.y, mouse.horiz, mouse.top);
					}
				}
			} else {
				if (valid(x, y, d, 0)) {
					if (!valid(x, y - 1, d, 0)) {
						// Id the block above isn't solid, move down.
						if (valid(x, y + 1, d, 0))
							port = new Portal(mouse.x, (y+1)*BLOCK_WIDTH, mouse.horiz, mouse.top);
					} else if (!valid(x, y + 1, d, 0)) {
						// If the block below isn't solid, move up.
						port = new Portal(mouse.x, y*BLOCK_WIDTH, mouse.horiz, mouse.top);
					} else {
						port = new Portal(mouse.x, mouse.y, mouse.horiz, mouse.top);
					}
				}
			}

			// Check for portal-portal collision.
			if (port != null) {
				var other;
				if (e.shiftKey && port1 != null) {
					other = port1;
				} else if (!e.shiftKey && port2 != null) {
					other = port2;
				}

				if (other != null && other.horiz === port.horiz) {
					if (port.horiz) {
						if (Math.abs(port.x - other.x) < CHARACTER_SIZE && port.y == other.y) {
							port = null;
						}
					} else {
						if (Math.abs(port.y - other.y) < CHARACTER_SIZE && port.x == other.x) {
							port = null;
						}
					}
				}
			}

			if (port) {
				if (e.shiftKey)
					port2 = port;
				else
					port1 = port;
			}
		});
		$(document).on("mousemove.char", function(e) {
			var temp = $("canvas").offset();
			mouse.rx = (e.pageX - temp.left) / SCALE;
			mouse.ry = (e.pageY - temp.top) / SCALE;
			updateMouse();
		});
	};
	this.attach();
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
	i = 11*i; // Mike, Jacob, Brandon, Dain.

    var img = ASSETS["us"];
    var frames = SimpleFrames(img.width, img.height, 143, 11, 13);
    var sheet = new SpriteSheet(img, frames);

    var padding = new Padding(2, 7, 2, 0);
    var stoppedR = new StillAnimation(sheet, i+8, padding);
    var stoppedL = new StillAnimation(sheet, i+8, padding, true);
    var idleR = new Animation(sheet, i+8, 3, 0.3, padding, true);
    var idleL = new Animation(sheet, i+8, 3, 0.3, padding, true, false, false, true);
    var runningR = new Animation(sheet, i, 8, 0.1, padding, true);
    var runningL = new Animation(sheet, i, 8, 0.1, padding, true, false, false, true);
    var jumpingR = new Animation(sheet, i+45, 4, 0.1, padding, true);
    var jumpingL = new Animation(sheet, i+45, 4, 0.1, padding, true, false, false, true);
    var fallingR = new Animation(sheet, i+45, 4, 0.1, padding, true);
    var fallingL = new Animation(sheet, i+45, 4, 0.1, padding, true, false, false, true);

    var set = new AnimationSet(stoppedR, stoppedL, idleR, idleL, runningR, runningL, jumpingR, jumpingL, fallingR, fallingL);
    var cube = new CubeCharacter(map.cubeX, map.cubeY);

    return new PlayerCharacter(set, map, (map.cubeX && cube));
}