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
var ENGINE = new (function() {
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
    var map = { x: 0, y: 0 };
    var deaths = 0;

    function getMap() {
        if (ch) {
            var w = CANVAS.width / SCALE;
            var h = CANVAS.height / SCALE;

            var x = ch.x - w / 2;
            if (x + w > MAPS.width) x = MAPS.width - w;
            if (x < 0) x = 0;

            var y = ch.y - h / 2;
            if (y + h > MAPS.height) y = MAPS.height - h;
            if (y < 0) y = 0;

            return { x: x, y: y };
        }

        return { x: 0, y: 0 };
    }

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
        map = getMap();
        chCur = c;
    };
    this.resume = function() {
        SOUNDS.resume();

        cScreen.detach();
        cScreen = null;
    };
    this.killPlayer = function() {
        if (cScreen == null) {
            ASSETS["sizzle"].audio.play();

            deaths++;
            cScreen = new DeathScreen(deaths);
            SOUNDS.stopAll();
        }
    };
    this.restart = function() {
        SOUNDS.clear();

        cScreen.detach();
        cScreen = null;
        MAPS.switchTo(MAPS.current);
        ch = CreatePlayerCharacter(chCur, MAPS[MAPS.current]);  
        map = getMap();      
    };
    this.endLevel = function() {
        SOUNDS.stopAll();

        cScreen = new LevelScreen(MAPS.current !== MAPS.length - 1);
    };
    this.nextLevel = function() {
        SOUNDS.clear();

        MAPS.nextLevel();
        ch = CreatePlayerCharacter(chCur, MAPS[MAPS.current]);
        map = getMap();
        cScreen.detach();
        cScreen = null;
    };

    this.draw = function() {
        if (ch) {
            MAPS.draw(map.x, map.y);
            ch.draw(map.x, map.y);
        }
        if (cScreen) cScreen.draw();
    };
    this.step = function(dt) {
        if (ch && !cScreen) { 
            MAPS.step(dt);
            ch.update(dt, MAPS[MAPS.current]);

            if (ch) {
                var t = getMap();
                var dx = (t.x - map.x);
                map.x += 4 * dx * dt;

                var dy = (t.y - map.y);
                map.y += 8 * dy * dt;
            }
        }
    };

    var that = this;
    onAssetLoad = function() {
        ASSETS["sizzle"].audio.volume = 0.15;
        ASSETS["jump"].audio.volume = 0.5;

        MAPS.compile();
        cScreen = new TitleScreen();

        // Start the update/render loop.
        updates = new UpdateManager();

        // Attach a listener for P key.
        $(document).keydown(function(e) {
            if (ch && !cScreen && e.which === "P".charCodeAt(0)) {
                cScreen = new PauseScreen();
                SOUNDS.stopAll();
            }
            if (ch && !cScreen && e.which === "L".charCodeAt(0)) {
                that.endLevel();
            }
        });
    };
})();