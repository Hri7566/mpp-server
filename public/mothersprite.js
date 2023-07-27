if(typeof module !== "undefined") {
	module.exports = mothersprite;
} else {
	this.ebsprite = mothersprite;
}

var spriteData = [
    {
        "name": "Boney",
        "sprites": [
            "1", "2", "3", "4",
            "5", "6", "7", "8",
            "9", "10", "11", "12",
            "13", "14", "15", "16"
        ]
    },
    {
        "name": "Duster",
        "sprites": [
            "17", "18", "19", "20",
            "21", "22", "23", "24",
            "25", "26", "27", "28",
            "29", "30", "31", "32"
        ]
    },
    {
        "name": "Lucas",
        "sprites": [
            "33", "34", "35", "36",
            "37", "38", "39", "40",
            "41", "42", "43", "44",
            "45", "46", "47", "48"
        ]
    },
	{
		"name": "Flint",
		"sprites": [
			"49", "50", "51", "52",
			"53", "54", "55", "56",
			"57", "58", "59", "60",
			"61", "62", "63", "64"
		]
	},
	{
		"name": "Porky",
		"sprites": [
			"65", "66", "67", "68",
			"69", "70", "71", "72",
			"73", "74", "75", "76",
			"77", "78", "79", "80"
		]
	}
];

function mothersprite() {
}

mothersprite.start = function(client) {
	if(this.run) return;

	var self = this;

	this.run = true;
	this.client = client;
	this.canvas = document.createElement("canvas");
	var canvas = this.canvas;
	document.body.insertBefore(this.canvas, document.body.firstChild);

	this.canvas.width = window.innerWidth;
	this.canvas.height = window.innerHeight;
	this.canvas.style.position = "absolute";
	var camera = new Camera(this.canvas.width, this.canvas.height);
	var context = this.canvas.getContext("2d");
	context.fillStyle = "rgb(255,255,255)";

	requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||  
		window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
		
	var ySort = function(a, b) {
		return a.position.y - b.position.y;
	};

	var directionMap = {
		"up": {x: 0, y: -1},
		"up-right": {x: 0.707106782, y: -0.707106782},
		"right": {x: 1, y: 0},
		"right-down": {x: 0.707106782, y: 0.707106782},
		"down": {x: 0, y: 1},
		"down-left": {x: -0.707106782, y: 0.707106782},
		"left": {x: -1, y: 0},
		"left-up": {x: -0.707106782, y: -0.707106782}
	};

	var render_loop = function() {
		var players = [];
		for(var i in playerMap) {
			players.push(playerMap[i]);
		}
		context.clearRect(0, 0, self.canvas.width, self.canvas.height);
		for(var i in players) {
			var player = players[i];
			if(player.walking) {
				var vec = directionMap[player.direction];
				var time = Date.now() - player.updateTime;
				player.position.x = player.updatePosition.x + (vec.x * player.walkSpeed * time);
				player.position.y = player.updatePosition.y + (vec.y * player.walkSpeed * time);
				if(player.position.x < 0) player.position.x = 0;
				else if(player.position.x > canvas.width) player.position.x = canvas.width;
				if(player.position.y < 0) player.position.y = 0;
				else if(player.position.y > canvas.width) player.position.y = canvas.width;
			}
		}
		players.sort(ySort);
		for(var i in players) {
			var player = players[i];
			var img = player.spriteProvider.getCurrentSprite(player);
			if(img) context.drawImage(img,
				Math.floor(player.position.x - camera.position.x - (img.width / 2)),
				Math.floor(player.position.y - camera.position.y - img.height));
			/*if(player.chat) {
				var text = player.chat;
				var t = Math.floor((Date.now() - player.chatTime) / 50);
				text = text.substring(0, t);
				context.fillText(text,
					Math.floor(player.position.x - camera.position.x),
					Math.floor(player.position.y - camera.position.y - img.height) - 10);
			}*/
		}
		if(self.run) requestAnimationFrame(render_loop);
	};
	render_loop();

	this.onresize = function() {
		canvas.width = $(window).width();
		canvas.height = $(window).height();
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
	window.addEventListener("resize", this.onresize);

	function downloadImage(url, cb) {
		var img = new Image();
		img.onerror = function() {
			cb("onerror", img);
		};
		img.onabort = function() {
			cb("onabort", img);
		};
		img.onload = function() {
			cb(false, img);
		};
		img.src = url;
	};
	
	function downloadImages(urls, cb) {
		var imgs = new Array(urls.length);
		var c = 0;
		for(var i in urls) {
			(function() {
				var j = i;
				downloadImage(urls[j], function(err, img) {
					if(err) {
						cb(err, imgs);
						cb = function() {};
					} else {
						imgs[j] = img;
						if(++c == urls.length) {
							cb(false, imgs);
						}
					}
				});
			})();
		}
	};
	
	function Camera(width, height) {
		this.width = width;
		this.height = height;
		this.position = {x: 0, y: 0};
	};
	
	function SpriteProvider(sprites, cb) {
		var urls = new Array(sprites.length);
		for(var i in sprites) {
			urls[i] = "https://mpp.hri7566.info/mothersprite/" + sprites[i] + ".png";
		}
		downloadImages(urls, (function(err, imgs) {
			if(!err) {
				var s = imgs;
				this.sprites = {};
				this.sprites["up"] = [s[0], s[1]];
				this.sprites["right"] = [s[2], s[3]];
				this.sprites["down"] = [s[4], s[5]];
				this.sprites["left"] = [s[6], s[7]];
				this.sprites["up-right"] = [s[8] || s[2], s[9] || s[3]];
				this.sprites["right-down"] = [s[10] || s[2], s[11] || s[3]];
				this.sprites["down-left"] = [s[12] || s[6], s[13] || s[7]];
				this.sprites["left-up"] = [s[14] || s[6], s[15] || s[7]];
			}
			if(cb) cb();
		}).bind(this));
	};

	//SpriteProvider.prototype.sprites = {};
	SpriteProvider.prototype = new SpriteProvider(["2354","2355","2356","2357","2358","2359","2360","2361"]);
	
	SpriteProvider.prototype.getCurrentSprite = function(player) {
		if(this.sprites && this.sprites[player.direction]) {
			if(player.walking) {
				var time = Date.now() - player.updateTime;
				return this.sprites[player.direction][time & 0x80 ? 0 : 1];
			} else {
				return this.sprites[player.direction][0];
			}
		}
	};

	var Player = function(id) {
        this.id = id;
		
		//this.sprites = spriteData[0].sprites;
		this.sprites = spriteData[parseInt(id, 16) % spriteData.length].sprites;
		this.spriteProvider = new SpriteProvider(this.sprites);
		this.canMoveDiagonally = (this.sprites[8] && this.sprites[9] && this.sprites[10] && this.sprites[11] && this.sprites[12] && this.sprites[13] && this.sprites[14] && this.sprites[15]) ? true : false;
		this.walkSpeed = 0.15;

		this.direction = "down";
		this.walking = false;
		this.updatePosition = {
			x: canvas.width / 2,
			y: canvas.height / 2
		};
		this.position = {x: this.updatePosition.x, y: this.updatePosition.y};
		this.updateTime = Date.now();
	};

	var player = new Player(client.participantId);
	var playerMap = {}
	playerMap[client.participantId] = player;
	
	
	function move(id) {
		var player = playerMap[id];
		var part = client.ppl[id];
		if(!player || !part) return;
		var target = {x: (part.x / 100) * self.canvas.width, y: (client.ppl[id].y / 100) * self.canvas.height};
		var difference = {x: target.x - player.position.x, y: target.y - player.position.y};
		var distance = Math.sqrt(Math.pow(difference.x, 2) + Math.pow(difference.y, 2));
		if(distance > 4) {
			var angle = Math.atan2(difference.y, difference.x);
			angle += Math.PI; // account negative Math.PI
			angle += Math.PI / 8; // askew
			angle /= (Math.PI * 2);
			angle = Math.floor(angle * 8) % 8;
			var direction = ["left", "left-up", "up", "up-right", "right", "right-down", "down", "down-left"][angle];
			if(player.direction !== direction) {
				if((Date.now() - player.updateTime > 500) || !player.walking) {
					player.direction = direction;
					player.updatePosition = {x: player.position.x, y: player.position.y};
					player.updateTime = Date.now();
				}
			}
			if(distance > 75) {
				if(!player.walking) {
					player.walking = true;
					player.updatePosition = {x: player.position.x, y: player.position.y};
					player.updateTime = Date.now();
				}
			}
		} 
		if(distance < 25) {
			if(player.walking) {
				player.walking = false;
				player.updatePosition = {x: player.position.x, y: player.position.y};
				player.updateTime = Date.now();
			}
		}
	}

	this.animationInterval = setInterval(function() {
		move(client.participantId);
		for(var id in client.ppl) {
			if(!client.ppl.hasOwnProperty(id)) continue;
			move(id);
		}
	}, 50);

	this.participantAdded = function(part) {
        if (part._id !== "4a50b6981d9f08b9675cd49a") return;
		playerMap[part.id] = new Player(part.id);
	}
	for(var id in client.ppl) {
		if(!client.ppl.hasOwnProperty(id)) continue;
		playerMap[id] = new Player(id);
	}
	client.on("participant added", this.participantAdded);

	this.participantRemoved = function(part) {
		delete playerMap[part.id];
	}
	client.on("participant removed", this.participantRemoved);
}

mothersprite.stop = function() {
	this.run = false;
	if(this.canvas) {
		document.body.removeChild(this.canvas);
		this.canvas = undefined;
	}
	window.removeEventListener("resize", this.onresize);
	clearInterval(this.animationInterval);
	if(this.client) {
		this.client.off("participant added", this.participantAdded);
		this.client.off("participant removed", this.participantRemoved);
	}
}