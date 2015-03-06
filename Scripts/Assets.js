/////////////////////////////////////////////////////////////////////
//
// Assets.js - Defines asset management components for the game.
//
// Load Dependencies - <none>
// Use  Dependencies - <none>
//

var ASSETS = null;
var onAssetLoad = function() {};

// Method, used to create objects used in the AssetManager constructor.
// - name : The name of the asset.
// - path : The relative path of the asset.
// - type : The type of asset, either "img" or "sound".
//
// Usage: CreateAsset(name, path, type)(name, path, type)... .create();
function CreateAsset(name, path, type) {
	function AssetInfo(name, path, type) {
		this.name = name;
		this.path = path;
		this.type = type;
	}

	var obj = [];
	var ret = function(name, path, type) {
		obj.push(new AssetInfo(name, path, type));
		return ret;
	};
	ret.create = function() {
		return obj;
	};

	return ret(name, path, type);
}

// Constructor, defines a manager for game assets.
// - paths : An object created using CreateAsset.
// - callback : A callback method for when all the assets are loaded (Optional).
//
// Members:
// - this[name] : Gets the asset with the given name and has the following members:
//     - name : The name of the asset.
//     - path : The path of the asset.
//     - img : The <img> tag if an image asset.
// - getImg(name) : Gets the <img> tag for the given asset name.
function AssetManager(paths) {
	var thatAssets = this;
	var count = 0;

	function isDone() {
		return count == paths.length;
	}

	function makeLoad(msg, name, call) {
		return function() {
			if (call) call(this);

			if (DEBUG)
				console.log(msg + " " + name);
			count++;
			if (isDone() && typeof onAssetLoad === "function") {
				onAssetLoad();
			}
		};
	}

	function ImgAsset(name, path) {
		var imgAsset = this;
		this.name = name;
		this.path = path;
		
		this.img = new Image();

		function onLoad(img) {
			imgAsset.width = img.width;
			imgAsset.height = img.height;
		}

		this.img.addEventListener("load", makeLoad("Loaded", name, onLoad));
		this.img.addEventListener("error", makeLoad("Errored", name, onLoad));

		this.img.src = path;
	}
	function SoundAsset(name, path) {
		var soundAsset = this;
		this.name = name;
		this.path = path;

		this.audio = new Audio();

		this.audio.addEventListener("canplay", makeLoad("Loaded", name));
		this.audio.addEventListener("error", makeLoad("Errored", name));

		this.audio.src = path;
	}

	this.getImg = function(name) {
		return this[name].img;
	};

	for (var i in paths) {
		var data = paths[i];
		if (data.type === "img") {
			this[data.name] = new ImgAsset(data.name, data.path);
		} else if (data.type === "sound") {
			this[data.name] = new SoundAsset(data.name, data.path);
		} else if (DEBUG) {
			console.log("Unknown asset type '" + data.type + "'.");
		}
	}
}

ASSETS = new AssetManager(CreateAsset
		("level", "Images/level.png", "img")
		("us", "Images/dmbj.png", "img")
		("screens", "Images/screens.png", "img")
		("background", "Images/Background.png", "img")
		("title", "Images/PortalTitle.png", "img")
		("back1", "Sounds/level1.mp3", "sound")
		("back2", "Sounds/level2.mp3", "sound")
		("back3", "Sounds/level3.mp3", "sound")
		("back4", "Sounds/level4.mp3", "sound")
		("back5", "Sounds/level5.mp3", "sound")
		("back6", "Sounds/level6.mp3", "sound")
		("sizzle", "Sounds/sizzle.mp3", "sound")
		("jump", "Sounds/jump.mp3", "sound")
		("portal", "Sounds/portalsound.mp3", "sound")
		.create());