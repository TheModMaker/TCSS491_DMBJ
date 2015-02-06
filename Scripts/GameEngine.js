/////////////////////////////////////////////////////////////////////
//
// GameEngine.js - Defines the main game engine.
//
// Load Dependencies - Screens
// Use  Dependencies - Assets, Graphics, MapBase
//

// Contains the main game engine.
//
// Members:
// - function draw() : Draws the game.
// - function step(dt) : Steps the game forward the given delta-time.
var ENGINE = new (function GameEngine() {
    // Constructor, creates a new mamager that manages update/render loops.
    //
    // Members:
    // - function pause() : Pauses the update for the entities.
    // - function resume() : Resumes the update for the entities.
    // - function hide() : Stops rendering the entities.
    // - function show() : Resumes rendering the entities.
    function UpdateManager() {
        var rendering = true;
        var updating = true;

        this.pause = function() {
            updating = false;
        };
        this.resume = function() {
            updating = true;
        };
        this.hide = function() {
            rendering = false;
        };
        this.show = function() {
            rendering = true;
        };

        // Constructor, a timer that manages current game time.
        //
        // Members:
        // - function tick() : Steps the clock forward and returns the delta-time.
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
        (function animTick() {
            if (updating) {
                var dt = timer.tick();
                ENGINE.step(dt);
            }

            if (rendering) {
                CONTEXT.clearRect(0, 0, CANVAS.width, CANVAS.height);

                ENGINE.draw();
            }

            window.requestAnimationFrame(animTick);
        })();
    }

    var cScreen = null;
    var updates = null;
    var ch = null;
    var chCur = -1;
    var keysDown = [];
    var mapX = 0;
    var mapY = 0;
    var deaths = 0;

    this.titleScreen = function() {
        cScreen = new TitleScreen();
        deaths = 0;
        ch = null;
    };
    this.start = function(c) {
        cScreen.detach();
        cScreen = null;
        MAPS.switchTo(0);
        ch = CreatePlayerCharacter(c, MAPS[MAPS.current]);
        chCur = c;
    };
    this.resume = function() {
        cScreen.detach();
        cScreen = null;
    };
    this.killPlayer = function() {
        deaths++;
        cScreen = new DeathScreen(deaths);
    };
    this.restart = function() {
        cScreen.detach();
        cScreen = null;
        MAPS.switchTo(MAPS.current);
        ch = CreatePlayerCharacter(chCur, MAPS[MAPS.current]);        
    };
    this.endLevel = function() {
        cScreen = new LevelScreen(MAPS.current !== MAPS.length - 1);
    };
    this.nextLevel = function() {
        MAP.nextLevel();
        ch = CreatePlayerCharacter(chCur, MAPS[MAPS.current]);
    };

    this.draw = function() {
        if (ch) {
            MAPS.draw(mapX, mapY);
            ch.draw(mapX, mapY);
        }
        if (cScreen) cScreen.draw();
    };
    this.step = function(dt) {
        if (ch && !cScreen) { 
            MAPS.step(dt);
            ch.update(dt, MAPS[MAPS.current]);

            if (ch) {
                var x = ch.x - CANVAS.width / 2;
                if (x + CANVAS.width > MAPS.width) x = MAPS.width - CANVAS.width;
                if (x < 0) x = 0;
                var dx = (x - mapX);
                mapX += 4 * dx * dt;

                var y = ch.y - CANVAS.height / 2;
                if (y + CANVAS.height > MAPS.height) y = MAPS.height - CANVAS.height;
                if (y < 0) y = 0;
                var dy = (y - mapY);
                mapY += 8 * dy * dt;
            }
        }
    };

    onAssetLoad = function() {
        function helper(name) {
            var img = ASSETS[name];
            var frames = new SimpleFrames(img.width, img.width, 1, 1, 1);
            var sheet = new SpriteSheet(img, frames);
            return sheet[0];
        }

        var assets = {"-": helper("wall"), "~": helper("lava"), "*": helper("star"), "=": helper("walln"), " ": helper("air") };
        MAPS.setAssets(assets);

        cScreen = new TitleScreen();

        // Start the update/render loop.
        updates = new UpdateManager();

        // Attach a listener for P key.
        $(document).keydown(function(e) {
            if (ch && !cScreen && e.which === "P".charCodeAt(0)) {
                cScreen = new PauseScreen();
            }
        });
    };
})();