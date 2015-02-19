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

	function ImgAsset(name, path) {
		var imgAsset = this;
		this.name = name;
		this.path = path;
		
		this.img = new Image();

		function loaded(msg) {
			return function() {
				imgAsset.width = this.width;
				imgAsset.height = this.height;

				if (DEBUG)
					console.log(msg + " " + name);
				count++;
				if (isDone() && typeof onAssetLoad === "function") {
					onAssetLoad();
				}
			};
		}

		this.img.addEventListener("load", loaded("Loaded"));
		this.img.addEventListener("error", loaded("Errored"));

		this.img.src = path;
	}

	this.getImg = function(name) {
		return this[name].img;
	};

	for (var i in paths) {
		var data = paths[i];
		if (data.type === "img") {
			this[data.name] = new ImgAsset(data.name, data.path);
		}
	}
}

ASSETS = new AssetManager(CreateAsset
		("level", "Images/level.png", "img")
		("portals", "Images/portals.png", "img")
		("us", "Images/dmbj.png", "img")
		("screens", "Images/screens.png", "img")
		.create());