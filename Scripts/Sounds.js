/////////////////////////////////////////////////////////////////////
//
// Sounds.js - Defines the game sounds.
//
// Load Dependencies - <none>
// Use  Dependencies - <none>
//

// Constructor, defines a sound in the sound manager.
// - sound : The <audio> tag that contains the sound.
//
// Members:
// - function play(loop) : Starts the sound over and optionally loops.
// - function resume() : Resumes a previously stopped sound.
// - function stop() : Stops the sound.
function Sound(sound) {
	sound = sound.audio;
	this.play = function(loop) {
		sound.loop = loop;
		sound.currentTime = 0;
		sound.play();
	};
	this.resume = function() {
		sound.play();
	};
	this.stop = function() {
		sound.pause();
	};
}

// Defines the main sound manager.
//
// Members:
// - function play(sound) : Registers the given sound and plays it.
// - function stopAll() : Stops all registered sounds.
// - function clear() : Removes all registered sounds.
// - function resume() : Resumes all registered sounds.
var SOUNDS = new (function() {
	var sounds = [];

	this.play = function(sound) {
		sounds.push(sound.audio);
		sound.audio.volume = 0.15;
		sound.audio.currentTime = 0;
		sound.audio.loop = true;
		sound.audio.play();
	};
	this.stopAll = function() {
		for (var i = 0; i < sounds.length; i++) {
			sounds[i].pause();
		}
	};
	this.resume = function() {
		for (var i = 0; i < sounds.length; i++) {
			sounds[i].play();
		}
	};
	this.clear = function() {
		sounds.length = 0;
	};
})();