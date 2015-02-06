/////////////////////////////////////////////////////////////////////
//
// Screens.js - Defines game screens.
//
// Load Dependencies - <none>
// Use  Dependencies - jQuery, Graphics
//

// Constructor, base class for menu items.
// - start : The y-position to start drawing items.
// - choices : An array of choices, indicies.
// - call : The callback method.
function MenuScreen(start, choices, call) {
	var img = ASSETS["screens"];
	var frames = ComplexFrames(0, 0, 512, 129)
				(0, 130, 194, 57)(197, 130, 194, 57).create();
	this.sheet = new SpriteSheet(img, frames);
	var current = -1;
	var over = false;
	var screens = this;

	function update(x, y) {
		var temp = $("canvas").offset();
		x -= temp.left;
		y -= temp.top;

		over = false;
		var t = start;
		for (var i = 0; i < choices.length; i++) {
			var c = screens.sheet[1];
			var left = (CANVAS.width - c.width) / 2;
			if (y >= t && y < (t + c.width) && x >= left && x < (left + c.width)) {
				current = i;
				over = true;
			}
			t += c.height;
		}
	}

	// Add event handlers
	$(document).off(".screen");
	$(document).on("mousemove.screen", function(e) {
		update(e.pageX, e.pageY);
	});
	$(document).on("mouseup.screen", function(e) {
		current = -1;
		update(e.pageX, e.pageY);
		if (current != -1)
			call(current);
	});
	$(document).on("keydown.screen", function(e) {
		if (e.which === 13 && current != -1) {
			call(current);
		}
	});

	this.draw = function() {
		var h = start;
		for (var i = 0; i < choices.length; i++) {
			var frame = this.sheet[1 + (current === i)];
			frame.draw((CANVAS.width - frame.width) / 2, h);

			CONTEXT.save();
			CONTEXT.fillStyle = "#D8D8D8";
			CONTEXT.font = "42px serif";
			CONTEXT.textAlign = "center";
			CONTEXT.fillText(choices[i], CANVAS.width / 2, h + frame.height / 2 + 10);
			CONTEXT.restore();

			h += frame.height;
		}

		$("canvas").css("cursor", (over ? "pointer" : "auto"));
	};
	this.detach = function() {
		$(document).off(".screen");
		$("canvas").css("cursor", "auto");
	};
}

// Constructor, creates a new title screen.
//
// Members:
// - function draw() : Draws the title screen.
function TitleScreen() {
	MenuScreen.call(this, 215, ["Dain", "Mike", "Brandon", "Jacob"], function(i) {
		ENGINE.start(i);
	});
	var oldDraw = this.draw;

	this.draw = function() {
		var h = 25;
		var frame = this.sheet[0];
		frame.draw((CANVAS.width - frame.width) / 2, h);

		h += frame.height;

		CONTEXT.save();
		CONTEXT.font = "36px serif";
		CONTEXT.textAlign = "center";
		CONTEXT.fillText("Select Character", CANVAS.width / 2, h);
		CONTEXT.restore();

		oldDraw.call(this);
	};
}

// Constructor, creates a new pause screen.
//
// Members:
// - function draw() : Draws the pause screen.
function PauseScreen() {
	MenuScreen.call(this, 215, ["Resume", "Restart", "Title"], function(i) {
		switch (i) {
			case 0: ENGINE.resume(); break;
			case 1: ENGINE.restart(); break;
			case 2: ENGINE.titleScreen(); break;
		}
	});
	var oldDraw = this.draw;

	this.draw = function() {
		CONTEXT.save();
		CONTEXT.globalAlpha = 0.6;
		CONTEXT.fillStyle = "#E6E6E6";
		CONTEXT.rect(0, 0, CANVAS.width, CANVAS.height);
		CONTEXT.fill();
		CONTEXT.restore();
		
		CONTEXT.save();
		CONTEXT.font = "52px serif";
		CONTEXT.textAlign = "center";
		CONTEXT.fillText("Paused", CANVAS.width / 2, 125);
		CONTEXT.restore();

		oldDraw.call(this);
	};
}

// Constructor, creates a new death screen.
// - deaths : The current death count.
//
// Members:
// - function draw() : Draws the death screen.
function DeathScreen(deaths) {
	MenuScreen.call(this, 215, ["Restart", "Title"], function(i) {
		switch (i) {
			case 0: ENGINE.restart(); break;
			case 1: ENGINE.titleScreen(); break;
		}
	});
	var oldDraw = this.draw;

	this.draw = function() {
		CONTEXT.save();
		CONTEXT.globalAlpha = 0.6;
		CONTEXT.fillStyle = "#7A0000";
		CONTEXT.rect(0, 0, CANVAS.width, CANVAS.height);
		CONTEXT.fill();
		CONTEXT.restore();

		CONTEXT.save();
		CONTEXT.font = "48px serif";
		CONTEXT.textAlign = "center";
		CONTEXT.fillText("You Died...", CANVAS.width / 2, 125);

		CONTEXT.font = "32px serif";
		CONTEXT.fillText("Deaths: " + deaths, CANVAS.width / 2, 170);
		CONTEXT.restore();

		oldDraw.call(this);
	};
}

// Constructor, creates a new next level screen.
// - next : Whether there exists a next level.
//
// Members:
// - function draw() : Draws the next level screen.
function LevelScreen(next) {
	if (next) {
		MenuScreen.call(this, 215, ["Next", "Title"], function(i) {
			switch (i) {
				case 0: ENGINE.nextLevel(); break;
				case 1: ENGINE.titleScreen(); break;
			}
		});
	} else {
		MenuScreen.call(this, 215, ["Title"], function(i) {
			switch (i) {
				case 0: ENGINE.titleScreen(); break;
			}
		});
	}

	var oldDraw = this.draw;

	this.draw = function() {
		CONTEXT.save();
		CONTEXT.globalAlpha = 0.6;
		CONTEXT.fillStyle = "#E6E6E6";
		CONTEXT.rect(0, 0, CANVAS.width, CANVAS.height);
		CONTEXT.fill();
		CONTEXT.restore();

		CONTEXT.save();
		CONTEXT.font = "48px serif";
		CONTEXT.textAlign = "center";
		CONTEXT.fillText("You Won...", CANVAS.width / 2, 125);
		CONTEXT.restore();

		oldDraw.call(this);
	};
}