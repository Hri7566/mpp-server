$(function() {

	// var test_mode = (window.location.hash && window.location.hash.match(/^(?:#.+)*#test(?:#.+)*$/i));

	var gSeeOwnCursor = (window.location.hash && window.location.hash.match(/^(?:#.+)*#seeowncursor(?:#.+)*$/i));

	var gMidiOutTest = (window.location.hash && window.location.hash.match(/^(?:#.+)*#midiout(?:#.+)*$/i)); // todo this is no longer needed

	if (!Array.prototype.indexOf) {
		Array.prototype.indexOf = function(elt /*, from*/) {
			var len = this.length >>> 0;
			var from = Number(arguments[1]) || 0;
			from = (from < 0) ? Math.ceil(from) : Math.floor(from);
			if (from < 0) from += len;
			for (; from < len; from++) {
				if (from in this && this[from] === elt) return from;
			}
			return -1;
		};
	}

	window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame
		|| window.webkitRequestAnimationFrame || window.msRequestAnimationFrame
		|| function (cb) { setTimeout(cb, 1000 / 30); };






/*
	var gSoundPath = "mp3/";
	var gSoundExt = ".wav.mp3";
	
	// Yoshify.
	if ((window.location.hash && window.location.hash.match(/^(?:#.+)*#Piano_Great_and_Soft(?:#.+)*$/i))) {		
		gSoundPath = "https://dl.dropboxusercontent.com/u/216104606/GreatAndSoftPiano/";		
		gSoundExt = ".mp3";		
	}

	if ((window.location.hash && window.location.hash.match(/^(?:#.+)*#Piano_Loud_and_Proud(?:#.+)*$/i))) {		
		gSoundPath = "https://dl.dropboxusercontent.com/u/216104606/LoudAndProudPiano/";		
		gSoundExt = ".mp3";		
	}

	// electrashave
	if((window.location.hash && window.location.hash.match(/^(?:#.+)*#NewPiano(?:#.+)*$/i))) {
		gSoundPath = "https://dl.dropboxusercontent.com/u/258840068/CustomSounds/NewPiano/";
		gSoundExt = ".mp3";
	}

	// Ethan Walsh
	if((window.location.hash && window.location.hash.match(/^(?:#.+)*#HDPiano(?:#.+)*$/i))) {
		gSoundPath = "https://dl.dropboxusercontent.com/u/258840068/CustomSounds/HDPiano/";
		gSoundExt = ".wav";
	}
	if((window.location.hash && window.location.hash.match(/^(?:#.+)*#Harpischord(?:#.+)*$/i))) {
		gSoundPath = "https://dl.dropboxusercontent.com/u/24213061/Harpischord/";
		gSoundExt = ".wav";
	}
	if((window.location.hash && window.location.hash.match(/^(?:#.+)*#ClearPiano(?:#.+)*$/i))) {
		gSoundPath = "https://dl.dropboxusercontent.com/u/24213061/ClearPiano/";
		gSoundExt = ".wav";
	}

	// Alexander Holmfjeld
	if((window.location.hash && window.location.hash.match(/^(?:#.+)*#Klaver(?:#.+)*$/i))) {
		gSoundPath = "https://dl.dropboxusercontent.com/u/70730519/Klaver/";
		gSoundExt = ".wav";
	}
*/
	




























	var DEFAULT_VELOCITY = 0.5;












































	var TIMING_TARGET = 1000;



















// Utility

////////////////////////////////////////////////////////////////



var Rect = function(x, y, w, h) {
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	this.x2 = x + w;
	this.y2 = y + h;
};
Rect.prototype.contains = function(x, y) {
	return (x >= this.x && x <= this.x2 && y >= this.y && y <= this.y2);
};
















// performing translation

////////////////////////////////////////////////////////////////

	var Translation = (function() {
		var strings = {
			"people are playing": {
				"pt": "pessoas estão jogando",
				"es": "personas están jugando",
				"ru": "человек играет",
				"fr": "personnes jouent",
				"ja": "人が遊んでいる",
				"de": "Leute spielen",
				"zh": "人被打",
				"nl": "mensen spelen",
				"pl": "osób grają",
				"hu": "ember játszik"
			},
			"New Room...": {
				"pt": "Nova Sala ...",
				"es": "Nueva sala de...",
				"ru": "Новый номер...",
				"ja": "新しい部屋",
				"zh": "新房间",
				"nl": "nieuwe Kamer",
				"hu": "új szoba"
			},
			"room name": {
				"pt": "nome da sala",
				"es": "sala de nombre",
				"ru": "название комнаты",
				"fr": "nom de la chambre",
				"ja": "ルーム名",
				"de": "Raumnamen",
				"zh": "房间名称",
				"nl": "kamernaam",
				"pl": "nazwa pokój",
				"hu": "szoba neve"
			},
			"Visible (open to everyone)": {
				"pt": "Visível (aberto a todos)",
				"es": "Visible (abierto a todo el mundo)",
				"ru": "Visible (открытый для всех)",
				"fr": "Visible (ouvert à tous)",
				"ja": "目に見える（誰にでも開いている）",
				"de": "Sichtbar (offen für alle)",
				"zh": "可见（向所有人开放）",
				"nl": "Zichtbaar (open voor iedereen)",
				"pl": "Widoczne (otwarte dla wszystkich)",
				"hu": "Látható (nyitott mindenki számára)"
			},
			"Enable Chat": {
				"pt": "Ativar bate-papo",
				"es": "Habilitar chat",
				"ru": "Включить чат",
				"fr": "Activer discuter",
				"ja": "チャットを有効にする",
				"de": "aktivieren Sie chatten",
				"zh": "启用聊天",
				"nl": "Chat inschakelen",
				"pl": "Włącz czat",
				"hu": "a csevegést"
			},
			"Play Alone": {
				"pt": "Jogar Sozinho",
				"es": "Jugar Solo",
				"ru": "Играть в одиночку",
				"fr": "Jouez Seul",
				"ja": "一人でプレイ",
				"de": "Alleine Spielen",
				"zh": "独自玩耍",
				"nl": "Speel Alleen",
				"pl": "Zagraj sam",
				"hu": "Játssz egyedül"
			}
			// todo: it, tr, th, sv, ar, fi, nb, da, sv, he, cs, ko, ro, vi, id, nb, el, sk, bg, lt, sl, hr
			// todo: Connecting, Offline mode, input placeholder, Notifications
		};

		var setLanguage = function(lang) {
			language = lang
		};

		var getLanguage = function() {
			if(window.navigator && navigator.language && navigator.language.length >= 2) {
				return navigator.language.substr(0, 2).toLowerCase();
			} else {
				return "en";
			}
		};

		var get = function(text, lang) {
			if(typeof lang === "undefined") lang = language;
			var row = strings[text];
			if(row == undefined) return text;
			var string = row[lang];
			if(string == undefined) return text;
			return string;
		};

		var perform = function(lang) {
			if(typeof lang === "undefined") lang = language;
			$(".translate").each(function(i, ele) {
				var th = $(this);
				if(ele.tagName && ele.tagName.toLowerCase() == "input") {
					if(typeof ele.placeholder != "undefined") {
						th.attr("placeholder", get(th.attr("placeholder"), lang))
					}
				} else {
					th.text(get(th.text(), lang));
				}
			});
		};

		var language = getLanguage();

		return {
			setLanguage: setLanguage,
			getLanguage: getLanguage,
			get: get,
			perform: perform
		};
	})();

	Translation.perform();















// AudioEngine classes

////////////////////////////////////////////////////////////////

	var AudioEngine = function() {
	};

	AudioEngine.prototype.init = function(cb) {
		this.volume = 0.6;
		this.sounds = {};
		return this;
	};

	AudioEngine.prototype.load = function(id, url, cb) {
	};

	AudioEngine.prototype.play = function() {
	};

	AudioEngine.prototype.stop = function() {
	};

	AudioEngine.prototype.setVolume = function(vol) {
		this.volume = vol;
	};


	AudioEngineWeb = function() {
		this.threshold = 10;
		this.worker = new Worker("workerTimer.js"); //must be same origin
		var self = this;
		this.worker.onmessage = function(event)
			{
				if(event.data.args)
				if(event.data.args.action==0)
				{
					self.actualPlay(event.data.args.id, event.data.args.vol, event.data.args.time, event.data.args.part_id);
				}
				else
				{
					self.actualStop(event.data.args.id, event.data.args.time, event.data.args.part_id);
				}
			}
	};

	AudioEngineWeb.prototype = new AudioEngine();

	AudioEngineWeb.prototype.init = function(cb) {
		AudioEngine.prototype.init.call(this);

		this.paused = true;
		this.context = new AudioContext({
			latencyHint: 'interactive'
		});
		// this.context.suspend();

		this.masterGain = this.context.createGain();
		this.masterGain.connect(this.context.destination);
		this.masterGain.gain.value = this.volume;

		this.limiterNode = this.context.createDynamicsCompressor();
		this.limiterNode.threshold.value = -10;
		this.limiterNode.knee.value = 0;
		this.limiterNode.ratio.value = 20;
		this.limiterNode.attack.value = 0;
		this.limiterNode.release.value = 0.1;
		this.limiterNode.connect(this.masterGain);

		// for synth mix
		this.pianoGain = this.context.createGain();
		this.pianoGain.gain.value = 0.5;
		this.pianoGain.connect(this.limiterNode);
		this.synthGain = this.context.createGain();
		this.synthGain.gain.value = 0.5;
		this.synthGain.connect(this.limiterNode);

		this.playings = {};
		
		if(cb) setTimeout(cb, 0);
		return this;
	};

	AudioEngineWeb.prototype.load = function(id, url, cb) {
		var audio = this;
		var req = new XMLHttpRequest();
		req.open("GET", url);
		req.responseType = "arraybuffer";
		req.addEventListener("readystatechange", function(evt) {
			if(req.readyState !== 4) return;
			try {
				audio.context.decodeAudioData(req.response, function(buffer) {
					audio.sounds[id] = buffer;
					if(cb) cb();
				});
			} catch(e) {
				/*throw new Error(e.message
					+ " / id: " + id
					+ " / url: " + url
					+ " / status: " + req.status
					+ " / ArrayBuffer: " + (req.response instanceof ArrayBuffer)
					+ " / byteLength: " + (req.response && req.response.byteLength ? req.response.byteLength : "undefined"));*/
				new Notification({id: "audio-download-error", title: "Problem", text: "For some reason, an audio download failed with a status of " + req.status + ". ",
					target: "#piano", duration: 10000});
			}
		});
		req.send();
	};

	AudioEngineWeb.prototype.actualPlay = function(id, vol, time, part_id) { //the old play(), but with time insted of delay_ms.
		if(!this.sounds.hasOwnProperty(id)) return;
		var source = this.context.createBufferSource();
		source.buffer = this.sounds[id];
		var gain = this.context.createGain();
		gain.gain.value = vol;
		source.connect(gain);
		gain.connect(this.pianoGain);
		source.start(time);
		// Patch from ste-art remedies stuttering under heavy load
		if(this.playings[id]) {
			var playing = this.playings[id];
			playing.gain.gain.setValueAtTime(playing.gain.gain.value, time);
			playing.gain.gain.linearRampToValueAtTime(0.0, time + gPiano.audio.lramp);
			playing.source.stop(time + gPiano.audio.sstop);
			if(enableSynth && playing.voice) {
				playing.voice.stop(time);
			}
		}
		this.playings[id] = {"source": source, "gain": gain, "part_id": part_id};

		if(enableSynth) {
			this.playings[id].voice = new synthVoice(id, time);
		}
	}
	
	AudioEngineWeb.prototype.play = function(id, vol, delay_ms, part_id)
	{
		if(!this.sounds.hasOwnProperty(id)) return;
		var time = this.context.currentTime + (delay_ms / 1000); //calculate time on note receive.
		var delay = delay_ms - this.threshold;
		if(delay<=0) this.actualPlay(id, vol, time, part_id);
		else {
			this.worker.postMessage({delay:delay,args:{action:0/*play*/,id:id, vol:vol, time:time, part_id:part_id}}); // but start scheduling right before play.
		}
	}
	
	AudioEngineWeb.prototype.actualStop = function(id, time, part_id) {
		if(this.playings.hasOwnProperty(id) && this.playings[id] && this.playings[id].part_id === part_id) {
			var gain = this.playings[id].gain.gain;
			gain.setValueAtTime(gain.value, time);
			gain.linearRampToValueAtTime(gain.value * 0.1, time + gPiano.audio.lramps);
			gain.linearRampToValueAtTime(0.0, time + gPiano.audio.lramps2);
			this.playings[id].source.stop(time + gPiano.audio.sstops);
			

			if(this.playings[id].voice) {
				this.playings[id].voice.stop(time);
			}

			this.playings[id] = null;
		}
	};

	AudioEngineWeb.prototype.stop = function(id, delay_ms, part_id) {
			var time = this.context.currentTime + (delay_ms / 1000);
			var delay = delay_ms - this.threshold;
			if(delay<=0) this.actualStop(id, time, part_id);
			else {
				this.worker.postMessage({delay:delay,args:{action:1/*stop*/, id:id, time:time, part_id:part_id}});
			}
	};

	AudioEngineWeb.prototype.setVolume = function(vol) {
		AudioEngine.prototype.setVolume.call(this, vol);
		this.masterGain.gain.value = this.volume;
	};

	AudioEngineWeb.prototype.resume = function() {
		this.paused = false;
		this.context.resume();
	}

	class BlitzNote {
		constructor(buffer, gain, audioCtx) {
		  this.buffer = buffer
		  this.source = null
		  this.gain = gain
		  this.audioCtx = audioCtx
		}
	  
		play(velocity = 0) {
		  if (this.source) {
			this.source.stop()
		  }
	  
		  if (velocity) {
			this.gain.gain.setValueAtTime(velocity, this.audioCtx.currentTime)
	  
			this.source = this.audioCtx.createBufferSource()
			this.source.buffer = this.buffer
			this.source.connect(this.gain)
			this.source.addEventListener("ended", () => (this.source = null))
			this.source.start()
		  } else {
			this.source = null
		  }
		}
	  }

	  

	class AudioEngineBlitz {
		constructor() {}

		init() {
			this.paused = true;
			this.audio = new AudioContext({
				latencyHint: 'interactive'
			});
			this.audio.suspend();
			this.lramp = 0.2;
			this.volume = this.audio.createGain();
			this.setVolume(localStorage.volume || 0.6);
			this.volume.connect(this.audio.destination);
			this.notes = new Array(88);
			this.minvol = 0;
			this.keys = ["a-1","as-1","b-1","c0","cs0","d0","ds0","e0","f0","fs0","g0","gs0","a0","as0","b0","c1","cs1","d1","ds1","e1","f1","fs1","g1","gs1","a1","as1","b1","c2","cs2","d2","ds2","e2","f2","fs2","g2","gs2","a2","as2","b2","c3","cs3","d3","ds3","e3","f3","fs3","g3","gs3","a3","as3","b3","c4","cs4","d4","ds4","e4","f4","fs4","g4","gs4","a4","as4","b4","c5","cs5","d5","ds5","e5","f5","fs5","g5","gs5","a5","as5","b5","c6","cs6","d6","ds6","e6","f6","fs6","g6","gs6","a6","as6","b6","c7"];
			this.playing = {};
			this.audio.lramp = 0.2;
			return this;

			// Promise.all(keys.map((k) => fetch(`https://mppclone.com/sounds/mppclassic/${k}.mp3`).then((r) => r.arrayBuffer())))
			// 	.then((p) => Promise.all(p.map((blob) => this.audio.decodeAudioData(blob))))
			// 	.then((buffers) => {
			// 		const globalVolume = this.audio.createGain()
			// 		globalVolume.connect(this.audio.destination)
			
			// 		const notes = buffers.map((buffer) => {
			// 			const gain = this.audio.createGain()
			// 			gain.connect(globalVolume)
				
			// 			return new BlitzNote(buffer, gain, this.audio)
			// 		});
			// 	})
		}

		load(id, url, cb) {
			fetch(url).then(r => r.arrayBuffer()).then(b => this.audio.decodeAudioData(b)).then(buffer => {
						let vol = this.audio.createGain();
						vol.connect(this.volume);
						this.notes[this.keys.indexOf(id)] = new BlitzNote(buffer, vol, this.audio);
						cb();
				});// .then(blob => this.audio.decodeAudioData(blob))
					// audio.context.decodeAudioData(req.response, function(buffer) {
					// 	audio.sounds[id] = buffer;
					// 	if(cb) cb();
					// });
		}

		setVolume(vol) {
			// this.volume.gain.setValueAtTime(vol, this.audio.currentTime);
			try {
				this.volume.gain.setValueAtTime(vol / 2, this.audio.currentTime);
			} catch (err) {
				try {
					this.volume.gain.setValueAtTime(vol, this.audio.currentTime);
				} catch (err) {
					this.volume.gain.setValueAtTime(0.3, this.audio.currentTime);
				}
			}
		}
		
		play(key, vol, delay_ms, participant) {
			queueMicrotask(() => {
				this.playReal(key, vol, delay_ms, participant);
			});
		}

		playReal(key, vol, delay_ms, participant) {
			if (this.paused) return;
			const note = this.notes[this.keys.indexOf(key)];
			let v = this.audio.createGain();
			v.connect(this.volume);
			note.gain = v;
			this.playing[key] = note;
			setTimeout(() => {
				note.play(vol);
			}, delay_ms);
		}

		stop(key, delay, id) {
			if (this.paused) return;
			const note = this.playing[key];
			if (!note) return;
			note.gain.gain.linearRampToValueAtTime(0.0, this.audio.currentTime + (delay + this.lramp));
			note.gain.gain.setValueAtTime(note.gain.gain.value, this.audio.currentTime + delay);
			// note.play(0);
		}

		resume() {
			this.audio.resume();
			this.paused = false;

			// this.notes.forEach(n => {
			// 	n.play(1);
			// })
		}
	}
	  












// VolumeSlider inst

////////////////////////////////////////////////////////////////

	var VolumeSlider = function(ele, cb) {
		this.rootElement = ele;
		this.cb = cb;
		var range = document.createElement("input");
		try {
			range.type = "range";
		} catch(e) {
			// hello, IE9
		}
		if(range.min !== undefined) {
			this.range = range;
			this.rootElement.appendChild(range);
			range.className = "volume-slider";
			range.min = "0.0";
			range.max = "1.0";
			range.step = "0.01";
			$(range).on("change", function(evt) {
				cb(range.value);
			});
		} else {
			if(window.console) console.log("warn: no slider");
			// todo
		}
	};

	VolumeSlider.prototype.set = function(v) {
		if(this.range !== undefined) {
			this.range.value = v;
		} else {
			// todo
		}
	};



















// Renderer classes

////////////////////////////////////////////////////////////////

	var Renderer = function() {
	};

	Renderer.prototype.init = function(piano) {
		this.piano = piano;
		this.resize();
		return this;
	};

	Renderer.prototype.resize = function(width, height) {
		if(typeof width == "undefined") width = $(this.piano.rootElement).width();
		if(typeof height == "undefined") height = Math.floor(width * 0.2);
		$(this.piano.rootElement).css({"height": height + "px", marginTop: Math.floor($(window).height() / 2 - height / 2) + "px"});
		this.width = width * devicePixelRatio;
		this.height = height * devicePixelRatio;
	};

	Renderer.prototype.visualize = function(key, color) {
	};




	var DOMRenderer = function() {
		Renderer.call(this);
	};

	DOMRenderer.prototype = new Renderer();

	DOMRenderer.prototype.init = function(piano) {
		// create keys in dom
		for(var i in piano.keys) {
			if(!piano.keys.hasOwnProperty(i)) continue;
			var key = piano.keys[i];
			var ele = document.createElement("div");
			key.domElement = ele;
			piano.rootElement.appendChild(ele);
			// "key sharp cs cs2"
			ele.note = key.note;
			ele.id = key.note;
			ele.className = "key " + (key.sharp ? "sharp " : " ") + key.baseNote + " " + key.note + " loading";
			var table = $('<table width="100%" height="100%" style="pointer-events:none"></table>');
			var td = $('<td valign="bottom"></td>');
			table.append(td);
			td.valign = "bottom";
			$(ele).append(table);
		}
		// add event listeners
		var mouse_down = false;
		$(piano.rootElement).mousedown(function(event) {
			// todo: IE10 doesn't support the pointer-events css rule on the "blips"
			var ele = event.target;
			if($(ele).hasClass("key") && piano.keys.hasOwnProperty(ele.note)) {
				var key = piano.keys[ele.note];
				press(key.note);
				mouse_down = true;
				event.stopPropagation();
			};
			//event.preventDefault();
		});
		piano.rootElement.addEventListener("touchstart", function(event) {
			for(var i in event.changedTouches) {
				var ele = event.changedTouches[i].target;
				if($(ele).hasClass("key") && piano.keys.hasOwnProperty(ele.note)) {
					var key = piano.keys[ele.note];
					press(key.note);
					mouse_down = true;
					event.stopPropagation();
				}
			}
			//event.preventDefault();
		}, false);
		$(window).mouseup(function(event) {
			mouse_down = false;
		});
		$(piano.rootElement).mouseover(function(event) {
			if(!mouse_down) return;
			var ele = event.target;
			if($(ele).hasClass("key") && piano.keys.hasOwnProperty(ele.note)) {
				var key = piano.keys[ele.note];
				press(key.note);
			}
		});

		Renderer.prototype.init.call(this, piano);
		return this;
	};

	DOMRenderer.prototype.resize = function(width, height) {
		Renderer.prototype.resize.call(this, width, height);
	};

	DOMRenderer.prototype.visualize = function(key, color) {
		var k = $(key.domElement);
		k.addClass("play");
		setTimeout(function(){
			k.removeClass("play");
		}, 100);
		// "blips"
		var d = $('<div style="width:100%;height:10%;margin:0;padding:0">&nbsp;</div>');
		d.css("background", color);
		k.find("td").append(d);
		d.fadeOut(1000, function(){
			d.remove();
		});
	};




	// var CanvasRenderer = function() {
	// 	Renderer.call(this);
	// };

	// CanvasRenderer.prototype = new Renderer();

	// CanvasRenderer.prototype.init = function(piano) {
	// 	this.canvas = document.createElement("canvas");
	// 	this.ctx = this.canvas.getContext("2d");
	// 	piano.rootElement.appendChild(this.canvas);

	// 	Renderer.prototype.init.call(this, piano); // calls resize()

	// 	// create render loop
	// 	var self = this;
	// 	var render = function() {
	// 		self.redraw();
	// 		requestAnimationFrame(render);
	// 	};
	// 	requestAnimationFrame(render);

	// 	// add event listeners
	// 	var mouse_down = false;
	// 	var last_key = null;
	// 	$(piano.rootElement).mousedown(function(event) {
	// 		mouse_down = true;
	// 		//event.stopPropagation();
	// 		event.preventDefault();

	// 		var pos = CanvasRenderer.translateMouseEvent(event);
	// 		var hit = self.getHit(pos.x, pos.y);
	// 		if(hit) {
	// 			press(hit.key.note, hit.v);
	// 			last_key = hit.key;
	// 		}
	// 	});
	// 	piano.rootElement.addEventListener("touchstart", function(event) {
	// 		mouse_down = true;
	// 		//event.stopPropagation();
	// 		event.preventDefault();
	// 		for(var i in event.changedTouches) {
	// 			var pos = CanvasRenderer.translateMouseEvent(event.changedTouches[i]);
	// 			var hit = self.getHit(pos.x, pos.y);
	// 			if(hit) {
	// 				press(hit.key.note, hit.v);
	// 				last_key = hit.key;
	// 			}
	// 		}
	// 	}, false);
	// 	$(window).mouseup(function(event) {
	// 		if(last_key) {
	// 			release(last_key.note);
	// 		}
	// 		mouse_down = false;
	// 		last_key = null;
	// 	});
	// 	/*$(piano.rootElement).mousemove(function(event) {
	// 		if(!mouse_down) return;
	// 		var pos = CanvasRenderer.translateMouseEvent(event);
	// 		var hit = self.getHit(pos.x, pos.y);
	// 		if(hit && hit.key != last_key) {
	// 			press(hit.key.note, hit.v);
	// 			last_key = hit.key;
	// 		}
	// 	});*/

	// 	return this;
	// };

	// CanvasRenderer.prototype.resize = function(width, height) {
	// 	Renderer.prototype.resize.call(this, width, height);
	// 	if(this.width < 52 * 2) this.width = 52 * 2;
	// 	if(this.height < this.width * 0.2) this.height = Math.floor(this.width * 0.2);
	// 	this.canvas.width = this.width;
	// 	this.canvas.height = this.height;
	// 	this.canvas.style.width = this.width / devicePixelRatio + "px";
	// 	this.canvas.style.height = this.height / devicePixelRatio + "px";
		
	// 	// calculate key sizes
	// 	this.whiteKeyWidth = Math.floor(this.width / 52);
	// 	this.whiteKeyHeight = Math.floor(this.height * 0.9);
	// 	this.blackKeyWidth = Math.floor(this.whiteKeyWidth * 0.75) - 1;
	// 	this.blackKeyHeight = Math.floor(this.height * 0.5);

	// 	this.blackKeyOffset = Math.floor(this.whiteKeyWidth - (this.blackKeyWidth / 2));
	// 	this.keyMovement = Math.floor(this.whiteKeyHeight * 0.015);

	// 	this.whiteBlipWidth = Math.floor(this.whiteKeyWidth - 3);
	// 	this.whiteBlipHeight = Math.floor(this.whiteBlipWidth * 0.7);
	// 	this.whiteBlipX = Math.floor((this.whiteKeyWidth - this.whiteBlipWidth) / 2);
	// 	this.whiteBlipY = Math.floor(this.whiteKeyHeight - this.whiteBlipHeight - 1);
	// 	this.blackBlipWidth = Math.floor(this.blackKeyWidth - 2);
	// 	this.blackBlipHeight = Math.floor(this.blackBlipWidth * 0.7);
	// 	this.blackBlipY = Math.floor(this.blackKeyHeight - this.blackBlipHeight - 1);
	// 	this.blackBlipX = Math.floor((this.blackKeyWidth - this.blackBlipWidth) / 2);
		
	// 	// prerender white key
	// 	/*
	// 	this.whiteKeyRender = document.createElement("canvas");
	// 	this.whiteKeyRender.width = this.whiteKeyWidth;
	// 	this.whiteKeyRender.height = this.height + 10;
	// 	var ctx = this.whiteKeyRender.getContext("2d");
	// 	if(ctx.createLinearGradient) {
	// 		var gradient = ctx.createLinearGradient(0, 0, 0, this.whiteKeyHeight);
	// 		gradient.addColorStop(0, "#eee");
	// 		gradient.addColorStop(0.75, "#fff");
	// 		gradient.addColorStop(1, "#dad4d4");
	// 		ctx.fillStyle = gradient;
	// 	} else {
	// 		ctx.fillStyle = "#fff";
	// 	}
	// 	ctx.strokeStyle = "#000";
	// 	ctx.lineJoin = "round";
	// 	ctx.lineCap = "round";
	// 	ctx.lineWidth = 10;
	// 	ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, this.whiteKeyWidth - ctx.lineWidth, this.whiteKeyHeight - ctx.lineWidth);
	// 	ctx.lineWidth = 4;
	// 	ctx.fillRect(ctx.lineWidth / 2, ctx.lineWidth / 2, this.whiteKeyWidth - ctx.lineWidth, this.whiteKeyHeight - ctx.lineWidth);
		
	// 	// prerender black key
	// 	this.blackKeyRender = document.createElement("canvas");
	// 	this.blackKeyRender.width = this.blackKeyWidth + 10;
	// 	this.blackKeyRender.height = this.blackKeyHeight + 10;
	// 	var ctx = this.blackKeyRender.getContext("2d");
	// 	if(ctx.createLinearGradient) {
	// 		var gradient = ctx.createLinearGradient(0, 0, 0, this.blackKeyHeight);
	// 		gradient.addColorStop(0, "#000");
	// 		gradient.addColorStop(1, "#444");
	// 		ctx.fillStyle = gradient;
	// 	} else {
	// 		ctx.fillStyle = "#000";
	// 	}
	// 	ctx.strokeStyle = "#222";
	// 	ctx.lineJoin = "round";
	// 	ctx.lineCap = "round";
	// 	ctx.lineWidth = 8;
	// 	ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, this.blackKeyWidth - ctx.lineWidth, this.blackKeyHeight - ctx.lineWidth);
	// 	ctx.lineWidth = 4;
	// 	ctx.fillRect(ctx.lineWidth / 2, ctx.lineWidth / 2, this.blackKeyWidth - ctx.lineWidth, this.blackKeyHeight - ctx.lineWidth);
	// 	*/
	// 	// prerender shadows
	// 	this.shadowRender = [];
	// 	var y = -this.canvas.height * 2;
	// 	for(var j = 0; j < 2; j++) {
	// 		var canvas = document.createElement("canvas");
	// 		this.shadowRender[j] = canvas;
	// 		canvas.width = this.canvas.width;
	// 		canvas.height = this.canvas.height;
	// 		var ctx = canvas.getContext("2d");
	// 		var sharp = j ? true : false;
	// 		ctx.lineJoin = "flat";
	// 		ctx.lineCap = "flat";
	// 		ctx.lineWidth = 1;
	// 		ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
	// 		ctx.shadowBlur = this.keyMovement * 3;
	// 		ctx.shadowOffsetY = -y + this.keyMovement;
	// 		if(sharp) {
	// 			ctx.shadowOffsetX = this.keyMovement;
	// 		} else {
	// 			ctx.shadowOffsetX = 0;
	// 			ctx.shadowOffsetY = -y + this.keyMovement;
	// 		}
	// 		for(var i in this.piano.keys) {
	// 			if(!this.piano.keys.hasOwnProperty(i)) continue;
	// 			var key = this.piano.keys[i];
	// 			if(key.sharp != sharp) continue;

	// 			if (key.sharp) {
	// 				ctx.fillRect(this.blackKeyOffset + this.whiteKeyWidth * key.spatial + ctx.lineWidth / 2,
	// 					y + ctx.lineWidth / 2,
	// 					this.blackKeyWidth - ctx.lineWidth, this.blackKeyHeight - ctx.lineWidth);
	// 			} else {
	// 				ctx.fillRect(this.whiteKeyWidth * key.spatial + ctx.lineWidth / 2,
	// 					y + ctx.lineWidth / 2,
	// 					this.whiteKeyWidth - ctx.lineWidth, this.whiteKeyHeight - ctx.lineWidth);
	// 			}
	// 		}
	// 	}
	// 	// update key rects
	// 	for(var i in this.piano.keys) {
	// 		if(!this.piano.keys.hasOwnProperty(i)) continue;
	// 		var key = this.piano.keys[i];
	// 		if(key.sharp) {
	// 			key.rect = new Rect(this.blackKeyOffset + this.whiteKeyWidth * key.spatial, 0,
	// 				this.blackKeyWidth, this.blackKeyHeight);
	// 		} else {
	// 			key.rect = new Rect(this.whiteKeyWidth * key.spatial, 0,
	// 				this.whiteKeyWidth, this.whiteKeyHeight);
	// 		}
	// 	}
	// };

	// CanvasRenderer.prototype.visualize = function(key, color) {
	// 	key.timePlayed = Date.now();
	// 	key.blips.push({"time": key.timePlayed, "color": color});
	// };

	// CanvasRenderer.prototype.redraw = function() {
	// 	var now = Date.now();
	// 	var timeLoadedEnd = now - 1000;
	// 	var timePlayedEnd = now - 100;
	// 	var timeBlipEnd = now - 1000;

	// 	this.ctx.save();
	// 	this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	// 	// draw all keys
	// 	for(var j = 0; j < 2; j++) {
	// 		this.ctx.globalAlpha = 1.0;
	// 		this.ctx.drawImage(this.shadowRender[j], 0, 0);
	// 		var sharp = j ? true : false;
	// 		for(var i in this.piano.keys) {
	// 			if(!this.piano.keys.hasOwnProperty(i)) continue;
	// 			var key = this.piano.keys[i];
	// 			if(key.sharp != sharp) continue;

	// 			if(!key.loaded) {
	// 				this.ctx.globalAlpha = 0.2;
	// 			} else if(key.timeLoaded > timeLoadedEnd) {
	// 				this.ctx.globalAlpha = ((now - key.timeLoaded) / 1000) * 0.8 + 0.2;
	// 			} else {
	// 				this.ctx.globalAlpha = 1.0;
	// 			}
	// 			var y = 0;
	// 			if(key.timePlayed > timePlayedEnd) {
	// 				y = Math.floor(this.keyMovement - (((now - key.timePlayed) / 100) * this.keyMovement));
	// 			}
	// 			var x = Math.floor(key.sharp ? this.blackKeyOffset + this.whiteKeyWidth * key.spatial
	// 				: this.whiteKeyWidth * key.spatial);
	// 			var clr = gPiano.color + 0x333333;
	// 			clr = clr > 0xFFFFFF ? 0xFFFFFF : clr;
	// 			this.ctx.fillStyle = sharp ? "#222222" : '#'+('000000'+clr.toString(16)).slice(-6);
	// 			this.ctx.fillRect(x, y, sharp ? this.blackKeyWidth : this.whiteKeyWidth-1, sharp ? this.blackKeyHeight : this.whiteKeyHeight);
	// 			// render blips
	// 			if(key.blips.length) {
	// 				var alpha = this.ctx.globalAlpha;
	// 				var w, h;
	// 				if(key.sharp) {
	// 					x += this.blackBlipX;
	// 					y = this.blackBlipY;
	// 					w = this.blackBlipWidth;
	// 					h = this.blackBlipHeight;
	// 				} else {
	// 					x += this.whiteBlipX;
	// 					y = this.whiteBlipY;
	// 					w = this.whiteBlipWidth;
	// 					h = this.whiteBlipHeight;
	// 				}
	// 				for(var b = 0; b < key.blips.length; b++) {
	// 					var blip = key.blips[b];
	// 					if(blip.time > timeBlipEnd) {
	// 						this.ctx.fillStyle = blip.color;
	// 						this.ctx.globalAlpha = alpha - ((now - blip.time) / 1000);
	// 						this.ctx.fillRect(x, y, w, h);
	// 					} else {
	// 						key.blips.splice(b, 1);
	// 						--b;
	// 					}
	// 					y -= h + 1;
	// 				}
	// 			}
	// 		}
	// 	}
	// 	this.ctx.restore();
	// };

	// CanvasRenderer.prototype.getHit = function(x, y) {
	// 	for(var j = 0; j < 2; j++) {
	// 		var sharp = j ? false : true; // black keys first
	// 		for(var i in this.piano.keys) {
	// 			if(!this.piano.keys.hasOwnProperty(i)) continue;
	// 			var key = this.piano.keys[i];
	// 			if(key.sharp != sharp) continue;
	// 			if(key.rect.contains(x, y)) {
	// 				var v = y / (key.sharp ? this.blackKeyHeight : this.whiteKeyHeight);
	// 				v += 0.25;
	// 				v *= DEFAULT_VELOCITY;
	// 				if(v > 1.0) v = 1.0;
	// 				return {"key": key, "v": v};
	// 			}
	// 		}
	// 	}
	// 	return null;
	// };


	// CanvasRenderer.isSupported = function() {
	// 	var canvas = document.createElement("canvas");
	// 	return !!(canvas.getContext && canvas.getContext("2d"));
	// };

	// CanvasRenderer.translateMouseEvent = function(evt) {
	// 	var element = evt.target;
	// 	var offx = 0;
	// 	var offy = 0;
	// 	do {
	// 		if(!element) break; // wtf, wtf?
	// 		offx += element.offsetLeft;
	// 		offy += element.offsetTop;
	// 	} while(element = element.offsetParent);
	// 	return {
	// 		x: (evt.pageX - offx) * devicePixelRatio,
	// 		y: (evt.pageY - offy) * devicePixelRatio
	// 	}
	// };

	var CanvasRenderer = function() {
		Renderer.call(this);
	};

	CanvasRenderer.prototype = new Renderer();

	CanvasRenderer.prototype.init = function(piano) {
		this.canvas = document.createElement("canvas");
		this.ctx = this.canvas.getContext("2d");
		piano.rootElement.appendChild(this.canvas);

		Renderer.prototype.init.call(this, piano); // calls resize()

		// create render loop
		var self = this;
		var render = function() {
			self.redraw();
			requestAnimationFrame(render);
		};
		requestAnimationFrame(render);

		// add event listeners
		var mouse_down = false;
		var last_key = null;
		$(piano.rootElement).mousedown(function(event) {
			mouse_down = true;
			//event.stopPropagation();
			event.preventDefault();

			var pos = CanvasRenderer.translateMouseEvent(event);
			var hit = self.getHit(pos.x, pos.y);
			if(hit) {
				press(hit.key.note, hit.v);
				last_key = hit.key;
			}
		});
		piano.rootElement.addEventListener("touchstart", function(event) {
			mouse_down = true;
			//event.stopPropagation();
			event.preventDefault();
			for(var i in event.changedTouches) {
				var pos = CanvasRenderer.translateMouseEvent(event.changedTouches[i]);
				var hit = self.getHit(pos.x, pos.y);
				if(hit) {
					press(hit.key.note, hit.v);
					last_key = hit.key;
				}
			}
		}, false);
		$(window).mouseup(function(event) {
			if(last_key) {
				release(last_key.note);
			}
			mouse_down = false;
			last_key = null;
		});
		/*$(piano.rootElement).mousemove(function(event) {
			if(!mouse_down) return;
			var pos = CanvasRenderer.translateMouseEvent(event);
			var hit = self.getHit(pos.x, pos.y);
			if(hit && hit.key != last_key) {
				press(hit.key.note, hit.v);
				last_key = hit.key;
			}
		});*/

		return this;
	};

	CanvasRenderer.prototype.resize = function(width, height) {
		Renderer.prototype.resize.call(this, width, height);
		if(this.width < 52 * 2) this.width = 52 * 2;
		if(this.height < this.width * 0.2) this.height = Math.floor(this.width * 0.2);
		this.canvas.width = this.width;
		this.canvas.height = this.height;
		this.canvas.style.width = this.width / devicePixelRatio + "px";
		this.canvas.style.height = this.height / devicePixelRatio + "px";
		
		// calculate key sizes
		this.whiteKeyWidth = Math.floor(this.width / 52);
		this.whiteKeyHeight = Math.floor(this.height * 0.9);
		this.blackKeyWidth = Math.floor(this.whiteKeyWidth * 0.75) - 1;
		this.blackKeyHeight = Math.floor(this.height * 0.5);

		this.blackKeyOffset = Math.floor(this.whiteKeyWidth - (this.blackKeyWidth / 2));
		this.keyMovement = Math.floor(this.whiteKeyHeight * 0.015);

		this.whiteBlipWidth = Math.floor(this.whiteKeyWidth - 3);
		this.whiteBlipHeight = Math.floor(this.whiteBlipWidth * 0.7);
		this.whiteBlipX = Math.floor((this.whiteKeyWidth - this.whiteBlipWidth) / 2);
		this.whiteBlipY = Math.floor(this.whiteKeyHeight - this.whiteBlipHeight - 1);
		this.blackBlipWidth = Math.floor(this.blackKeyWidth - 2);
		this.blackBlipHeight = Math.floor(this.blackBlipWidth * 0.7);
		this.blackBlipY = Math.floor(this.blackKeyHeight - this.blackBlipHeight - 1);
		this.blackBlipX = Math.floor((this.blackKeyWidth - this.blackBlipWidth) / 2);
		
		// prerender white key
		/*
		this.whiteKeyRender = document.createElement("canvas");
		this.whiteKeyRender.width = this.whiteKeyWidth;
		this.whiteKeyRender.height = this.height + 10;
		var ctx = this.whiteKeyRender.getContext("2d");
		if(ctx.createLinearGradient) {
			var gradient = ctx.createLinearGradient(0, 0, 0, this.whiteKeyHeight);
			gradient.addColorStop(0, "#eee");
			gradient.addColorStop(0.75, "#fff");
			gradient.addColorStop(1, "#dad4d4");
			ctx.fillStyle = gradient;
		} else {
			ctx.fillStyle = "#fff";
		}
		ctx.strokeStyle = "#000";
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		ctx.lineWidth = 10;
		ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, this.whiteKeyWidth - ctx.lineWidth, this.whiteKeyHeight - ctx.lineWidth);
		ctx.lineWidth = 4;
		ctx.fillRect(ctx.lineWidth / 2, ctx.lineWidth / 2, this.whiteKeyWidth - ctx.lineWidth, this.whiteKeyHeight - ctx.lineWidth);
		
		// prerender black key
		this.blackKeyRender = document.createElement("canvas");
		this.blackKeyRender.width = this.blackKeyWidth + 10;
		this.blackKeyRender.height = this.blackKeyHeight + 10;
		var ctx = this.blackKeyRender.getContext("2d");
		if(ctx.createLinearGradient) {
			var gradient = ctx.createLinearGradient(0, 0, 0, this.blackKeyHeight);
			gradient.addColorStop(0, "#000");
			gradient.addColorStop(1, "#444");
			ctx.fillStyle = gradient;
		} else {
			ctx.fillStyle = "#000";
		}
		ctx.strokeStyle = "#222";
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		ctx.lineWidth = 8;
		ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, this.blackKeyWidth - ctx.lineWidth, this.blackKeyHeight - ctx.lineWidth);
		ctx.lineWidth = 4;
		ctx.fillRect(ctx.lineWidth / 2, ctx.lineWidth / 2, this.blackKeyWidth - ctx.lineWidth, this.blackKeyHeight - ctx.lineWidth);
		*/
		// prerender shadows
		this.shadowRender = [];
		var y = -this.canvas.height * 2;
		for(var j = 0; j < 2; j++) {
			var canvas = document.createElement("canvas");
			this.shadowRender[j] = canvas;
			canvas.width = this.canvas.width;
			canvas.height = this.canvas.height;
			var ctx = canvas.getContext("2d");
			var sharp = j ? true : false;
			ctx.lineJoin = "flat";
			ctx.lineCap = "flat";
			ctx.lineWidth = 1;
			ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
			ctx.shadowBlur = this.keyMovement * 3;
			ctx.shadowOffsetY = -y + this.keyMovement;
			if(sharp) {
				ctx.shadowOffsetX = this.keyMovement;
			} else {
				ctx.shadowOffsetX = 0;
				ctx.shadowOffsetY = -y + this.keyMovement;
			}
			for(var i in this.piano.keys) {
				if(!this.piano.keys.hasOwnProperty(i)) continue;
				var key = this.piano.keys[i];
				if(key.sharp != sharp) continue;

				if (key.sharp) {
					ctx.fillRect(this.blackKeyOffset + this.whiteKeyWidth * key.spatial + ctx.lineWidth / 2,
						y + ctx.lineWidth / 2,
						this.blackKeyWidth - ctx.lineWidth, this.blackKeyHeight - ctx.lineWidth);
				} else {
					ctx.fillRect(this.whiteKeyWidth * key.spatial + ctx.lineWidth / 2,
						y + ctx.lineWidth / 2,
						this.whiteKeyWidth - ctx.lineWidth, this.whiteKeyHeight - ctx.lineWidth);
				}
			}
		}
		// update key rects
		for(var i in this.piano.keys) {
			if(!this.piano.keys.hasOwnProperty(i)) continue;
			var key = this.piano.keys[i];
			if(key.sharp) {
				key.rect = new Rect(this.blackKeyOffset + this.whiteKeyWidth * key.spatial, 0,
					this.blackKeyWidth, this.blackKeyHeight);
			} else {
				key.rect = new Rect(this.whiteKeyWidth * key.spatial, 0,
					this.whiteKeyWidth, this.whiteKeyHeight);
			}
		}
	};

	CanvasRenderer.prototype.visualize = function(key, color) {
		key.timePlayed = Date.now();
		key.blips.push({"time": key.timePlayed, "color": color});
	};

	CanvasRenderer.prototype.redraw = function() {
		var now = Date.now();
		var timeLoadedEnd = now - 1000;
		var timePlayedEnd = now - 100;
		var timeBlipEnd = now - 1000;

		this.ctx.save();
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		// draw all keys
		for(var j = 0; j < 2; j++) {
			this.ctx.globalAlpha = 1.0;
			this.ctx.drawImage(this.shadowRender[j], 0, 0);
			var sharp = j ? true : false;
			for(var i in this.piano.keys) {
				if(!this.piano.keys.hasOwnProperty(i)) continue;
				var key = this.piano.keys[i];
				if(key.sharp != sharp) continue;

				if(!key.loaded) {
					this.ctx.globalAlpha = 0.2;
				} else if(key.timeLoaded > timeLoadedEnd) {
					this.ctx.globalAlpha = ((now - key.timeLoaded) / 1000) * 0.8 + 0.2;
				} else {
					this.ctx.globalAlpha = 1.0;
				}
				var y = 0;
				if(key.timePlayed > timePlayedEnd) {
					y = Math.floor(this.keyMovement - (((now - key.timePlayed) / 100) * this.keyMovement));
				}
				var x = Math.floor(key.sharp ? this.blackKeyOffset + this.whiteKeyWidth * key.spatial
					: this.whiteKeyWidth * key.spatial);
				var clr = gPiano.color + 0x333333;
				clr = clr > 0xFFFFFF ? 0xFFFFFF : clr;
				this.ctx.fillStyle = sharp ? "#222222" : '#'+('000000'+clr.toString(16)).slice(-6);
				this.ctx.fillRect(x, y, sharp ? this.blackKeyWidth : this.whiteKeyWidth-1, sharp ? this.blackKeyHeight : this.whiteKeyHeight);
				const newHeight = 5;
				var clr2 = gPiano.color + 0x222222;
				clr2 = clr2 > 0xFFFFFF ? 0xFFFFFF : clr2;
				this.ctx.fillStyle = sharp ? "#1c1c1c" : '#'+('000000'+clr2.toString(16)).slice(-6);
				this.ctx.fillRect(x, y + (sharp ? this.blackKeyHeight : this.whiteKeyHeight) /*- newHeight*/, sharp ? this.blackKeyWidth : this.whiteKeyWidth-1, newHeight);
				// render blips
				if(key.blips.length) {
					var alpha = this.ctx.globalAlpha;
					var w, h;
					if(key.sharp) {
						x += this.blackBlipX;
						y = this.blackBlipY;
						w = this.blackBlipWidth;
						h = this.blackBlipHeight;
					} else {
						x += this.whiteBlipX;
						y = this.whiteBlipY;
						w = this.whiteBlipWidth;
						h = this.whiteBlipHeight;
					}
					for(var b = 0; b < key.blips.length; b++) {
						var blip = key.blips[b];
						if(blip.time > timeBlipEnd) {
							this.ctx.fillStyle = blip.color;
							this.ctx.globalAlpha = alpha - ((now - blip.time) / 1000);
							this.ctx.fillRect(x, y, w, h);
						} else {
							key.blips.splice(b, 1);
							--b;
						}
						y -= h + 1;
					}
				}
			}
		}
		this.ctx.restore();
	};

	CanvasRenderer.prototype.getHit = function(x, y) {
		for(var j = 0; j < 2; j++) {
			var sharp = j ? false : true; // black keys first
			for(var i in this.piano.keys) {
				if(!this.piano.keys.hasOwnProperty(i)) continue;
				var key = this.piano.keys[i];
				if(key.sharp != sharp) continue;
				if(key.rect.contains(x, y)) {
					var v = y / (key.sharp ? this.blackKeyHeight : this.whiteKeyHeight);
					v += 0.25;
					v *= DEFAULT_VELOCITY;
					if(v > 1.0) v = 1.0;
					return {"key": key, "v": v};
				}
			}
		}
		return null;
	};


	CanvasRenderer.isSupported = function() {
		var canvas = document.createElement("canvas");
		return !!(canvas.getContext && canvas.getContext("2d"));
	};

	CanvasRenderer.translateMouseEvent = function(evt) {
		var element = evt.target;
		var offx = 0;
		var offy = 0;
		do {
			if(!element) break; // wtf, wtf?
			offx += element.offsetLeft;
			offy += element.offsetTop;
		} while(element = element.offsetParent);
		return {
			x: (evt.pageX - offx) * devicePixelRatio,
			y: (evt.pageY - offy) * devicePixelRatio
		}
	};







// Soundpack Stuff by electrashave ♥

////////////////////////////////////////////////////////////////

	function SoundSelector(piano) {
		this.initialized = false;
		this.keys = piano.keys;
		this.loading = {};
		this.notification;
		this.packs = [];
		this.piano = piano;
		this.soundSelection = localStorage.soundSelection || "MPP Classic";
		this.addPack({name: "MPP Classic", keys: Object.keys(this.piano.keys), ext: ".wav.mp3", url: "/mp3/"});
	}

	SoundSelector.prototype.addPack = function(pack, load) {
		var self = this;
		self.loading[pack.url || pack] = true;
		function add(obj) {
			var added = false;
			for (var i = 0; self.packs.length > i; i++) {
				if (obj.name == self.packs[i].name) {
					added = true;
					break;
				}
			}

			if (added) return console.warn("Sounds already added!!"); //no adding soundpacks twice D:<

			if (obj.url.substr(obj.url.length-1) != "/") obj.url = obj.url + "/";
			var html = document.createElement("li");
			html.classList = "pack";
			html.innerText = obj.name + " (" + obj.keys.length + " keys)";
			html.onclick = function() {
				self.loadPack(obj.name);
				self.notification.close();
			};
			obj.html = html;
			self.packs.push(obj);
			self.packs.sort(function(a, b) {
				if(a.name < b.name) return -1;
				if(a.name > b.name) return 1;
				return 0;
			});
			if (load) self.loadPack(obj.name);
			delete self.loading[obj.url];
		}

		if (typeof pack == "string") {
			$.getJSON(pack + "/info.json").done(function(json) {
				json.url = pack;
				add(json);
			});
		} else add(pack); //validate packs??
	};

	SoundSelector.prototype.addPacks = function(packs) {
		for (var i = 0; packs.length > i; i++) this.addPack(packs[i]);
	};

	SoundSelector.prototype.init = function() {
		var self = this;
		if (self.initialized) return console.warn("Sound selector already initialized!");

		if (!!Object.keys(self.loading).length) return setTimeout(function() {
			self.init();
		}, 250);

		$("#sound-btn").on("click", function() {
			if (document.getElementById("Notification-Sound-Selector") != null) return self.notification.close();
			var html = document.createElement("ul");
			$(html).append("<h1>Current Sound: " + self.soundSelection + "</h1>");

			for (var i = 0; self.packs.length > i; i++) {
				var pack = self.packs[i];
				if (pack.name == self.soundSelection) pack.html.classList = "pack enabled";
				else pack.html.classList = "pack";
				html.appendChild(pack.html);
			}
			self.notification = new Notification({title: "Sound Selector:", html: html, id: "Sound-Selector", duration: -1, target: "#sound-btn"});
		});
		self.initialized = true;
		self.loadPack(self.soundSelection, true);
	};

	SoundSelector.prototype.loadPack = function(pack, f) {
		for (var i = 0; this.packs.length > i; i++) {
			var p = this.packs[i];
			if (p.name == pack) {
				pack = p;
				break;
			}
		}
		if (typeof pack == "string") {
			console.warn("Sound pack does not exist! Loading default pack...");
			return this.loadPack("MPP Classic");
		}

		if (pack.name == this.soundSelection && !f) return;
		if (pack.keys.length != Object.keys(this.piano.keys).length) {
			this.piano.keys = {};
			for (var i = 0; pack.keys.length > i; i++) this.piano.keys[pack.keys[i]] = this.keys[pack.keys[i]];
			this.piano.renderer.resize();
		}

		var self = this;
		for (var i in this.piano.keys) {
			if (!this.piano.keys.hasOwnProperty(i)) continue;
			(function() {
				var key = self.piano.keys[i];
				key.loaded = false;
				self.piano.audio.load(key.note, pack.url + key.note + pack.ext, function() {
					key.loaded = true;
					key.timeLoaded = Date.now();
				});
			})();
		}
		localStorage.soundSelection = pack.name;
		this.soundSelection = pack.name;
	};

	SoundSelector.prototype.removePack = function(name) {
		var found = false;
		for (var i = 0; this.packs.length > i; i++) {
			var pack = this.packs[i];
			if (pack.name == name) {
				this.packs.splice(i, 1);
				if (pack.name == this.soundSelection) this.loadPack(this.packs[0].name); //add mpp default if none?
				break;
			}
		}
		if (!found) console.warn("Sound pack not found!");
	};









// Pianoctor

////////////////////////////////////////////////////////////////

	var PianoKey = function(note, octave) {
		this.note = note + octave;
		this.baseNote = note;
		this.octave = octave;
		this.sharp = note.indexOf("s") != -1;
		this.loaded = false;
		this.timeLoaded = 0;
		this.domElement = null;
		this.timePlayed = 0;
		this.blips = [];
	};

	var Piano = function(rootElement) {
	
		var piano = this;
		piano.rootElement = rootElement;
		piano.keys = {};
		
		var white_spatial = 0;
		var black_spatial = 0;
		var black_it = 0;
		var black_lut = [2, 1, 2, 1, 1];
		var addKey = function(note, octave) {
			var key = new PianoKey(note, octave);
			piano.keys[key.note] = key;
			if(key.sharp) {
				key.spatial = black_spatial;
				black_spatial += black_lut[black_it % 5];
				++black_it;
			} else {
				key.spatial = white_spatial;
				++white_spatial;
			}
		}
		/*if(test_mode) {
			addKey("c", 2);
		} else {*/
			addKey("a", -1);
			addKey("as", -1);
			addKey("b", -1);
			var notes = "c cs d ds e f fs g gs a as b".split(" ");
			for(var oct = 0; oct < 7; oct++) {
				for(var i in notes) {
					addKey(notes[i], oct);
				}
			}
			addKey("c", 7);
		/*}*/


		var render_engine = CanvasRenderer.isSupported() ? CanvasRenderer : DOMRenderer;
		this.renderer = new render_engine().init(this);
		
		window.addEventListener("resize", function() {
			piano.renderer.resize();
		});


		window.AudioContext = window.AudioContext || window.webkitAudioContext || undefined;
		var audio_engine = AudioEngineWeb;
		// var audio_engine = AudioEngineBlitz;

		this.audio = new audio_engine().init(/*function() {
			for(var i in piano.keys) {
				if(!piano.keys.hasOwnProperty(i)) continue;
				(function() {
					var key = piano.keys[i];
					piano.audio.load(key.note, gSoundPath + key.note + gSoundExt, function() {
						key.loaded = true;
						key.timeLoaded = Date.now();
						if(key.domElement) // todo: move this to renderer somehow
							$(key.domElement).removeClass("loading");
					});
				})();
			}
		}/**/);
		this.audio.lramp = 0.2;
		this.audio.sstop = 0.21;
		this.audio.lramps = 0.16;
		this.audio.lramps2 = 0.4;
		this.audio.sstops = 0.41;
		this.audio.minvol = 0.05;
	};

	Piano.prototype.play = function(note, vol, participant, delay_ms) {
		if(!this.keys.hasOwnProperty(note)) return;
		var key = this.keys[note];
		if(key.loaded&&vol>this.audio.minvol) this.audio.play(key.note, vol, delay_ms, participant.id);
		if(typeof gMidiOutTest === "function") gMidiOutTest(key.note, vol * 100, delay_ms);
		var self = this;
		var jq_namediv = $(typeof participant == "undefined" ? null : participant.nameDiv);
		if(jq_namediv && !jq_namediv.hasClass("playing")) {
			setTimeout(function() {
				self.renderer.visualize(key, typeof participant == "undefined" ? "yellow" : (participant.color || "#777"));
				jq_namediv.addClass("play");
				setTimeout(function() {
					jq_namediv.removeClass("play");
				}, 30);
			}, delay_ms);
		}
	};

	Piano.prototype.stop = function(note, participant, delay_ms) {
		if(!this.keys.hasOwnProperty(note)) return;
		var key = this.keys[note];
		if(key.loaded) this.audio.stop(key.note, delay_ms, participant.id);
		if(typeof gMidiOutTest === "function") gMidiOutTest(key.note, 0, delay_ms);
	};
	
	var gPiano = new Piano(document.getElementById("piano"));
	
	var gSoundSelector = new SoundSelector(gPiano);
	gSoundSelector.addPacks([
	/*	"/sounds/Emotional_2.0/",
		"/sounds/Harp/",
		"/sounds/Music_Box/",
		"/sounds/Vintage_Upright/",
		"/sounds/Steinway_Grand/",
		"/sounds/Emotional/",
		"/sounds/Untitled/"*/
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/Emotional/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/Emotional_2.0/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/GreatAndSoftPiano/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/HardAndToughPiano/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/HardPiano/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/Harp/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/Harpsicord/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/LoudAndProudPiano/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/MLG/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/Music_Box/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/NewPiano/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/Orchestra/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/Piano2/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/PianoSounds/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/Rhodes_MK1/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/SoftPiano/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/Steinway_Grand/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/Untitled/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/Vintage_Upright/",
		"https://raw.githubusercontent.com/multiplayerpiano/piano-sounds/master/Vintage_Upright_Soft/",
		"https://hri7566.github.io/SM64MusicBox/",
		"https://hri7566.github.io/Dog/",
		"https://hri7566.github.io/RobloxDeathSound/",
		"https://hri7566.github.io/MarioPaintGuitar/",
		"https://raw.githubusercontent.com/Hri7566/sm64dire/master/"
	]);
	gSoundSelector.init();






	var gSustain = false;

	var gHeldNotes = {};
	var gSustainedNotes = {};
	

	function press(id, vol) {
		if(!gClient.preventsPlaying() && gNoteQuota.spend(1)) {
			gHeldNotes[id] = true;
			gSustainedNotes[id] = true;
			gPiano.play(id, vol !== undefined ? vol : DEFAULT_VELOCITY, gClient.getOwnParticipant(), 0);
			gClient.startNote(id, vol);
		}
	}

	function release(id) {
		if(gHeldNotes[id]) {
			gHeldNotes[id] = false;
			if(gSustain && !enableSynth) {
				gSustainedNotes[id] = true;
			} else {
				if(gNoteQuota.spend(1)) {
					gPiano.stop(id, gClient.getOwnParticipant(), 0);
					gClient.stopNote(id);
					gSustainedNotes[id] = false;
				}
			}
		}
	}

	function pressSustain() {
		gSustain = true;
	}

	function releaseSustain() {
		gSustain = false;
		for(var id in gSustainedNotes) {
			if(gSustainedNotes.hasOwnProperty(id) && gSustainedNotes[id] && !gHeldNotes[id]) {
				gSustainedNotes[id] = false;
				if(gNoteQuota.spend(1)) {
					gPiano.stop(id, gClient.getOwnParticipant(), 0);
					gClient.stopNote(id);
				}
			}
		}
	}









// internet science

////////////////////////////////////////////////////////////////

	// var channel_id = decodeURIComponent(window.location.hash.substr(1)) || "lobby";
	var channel_id = decodeURIComponent(window.location.pathname.substr(1) || "lobby");
	// var gClient = new Client("wss://mpp.hri7566.info:8443");
	let protocol = window.location.protocol == 'https:' ? 'wss:' : 'ws:';
	var gClient = new Client(`${protocol}//${window.location.hostname}:8443`);

	gClient.setChannel(channel_id);
	gClient.start();


	// Setting status
	(function() {
		gClient.on("status", function(status) {
			$("#status").text(status);
		});
		gClient.on("count", function(count) {
			if(count > 0) {
				$("#status").html('<span class="number">'+count+'</span> '+(count==1? 'person is' : 'people are')+' playing');
				document.title = "HMPP (" + count + ")";
			} else {
				document.title = "Hri7566's Multiplayer Piano";
			}
		});
	})();

	// Handle changes to participants
	(function() {
		gClient.on("participant added", function(part) {

			part.displayX = 150;
			part.displayY = 50;

			// add nameDiv
			var div = document.createElement("div");
			div.className = "name";
			div.participantId = part.id;
			div.textContent = part.name || "";
			div.style.backgroundColor = part.color || "#777";
			if(gClient.participantId === part.id) {
				$(div).addClass("me");
			}
			if(gClient.channel && gClient.channel.crown && gClient.channel.crown.participantId === part.id) {
				$(div).addClass("owner");
			}
			if(gPianoMutes.indexOf(part._id) !== -1) {
				$(part.nameDiv).addClass("muted-notes");
			}
			if(gChatMutes.indexOf(part._id) !== -1) {
				$(part.nameDiv).addClass("muted-chat");
			}
			if(EXT.draw && EXT.draw.mutes.indexOf(part._id) !== -1){
				$(part.nameDiv).addClass("muted-lines");
			}
			div.style.display = "none";
			part.nameDiv = $("#names")[0].appendChild(div);
			$(part.nameDiv).fadeIn(2000);

			// sort names
			var arr = $("#names .name");
			arr.sort(function(a, b) {
				a = a.style.backgroundColor; // todo: sort based on user id instead
				b = b.style.backgroundColor;
				if (a > b) return 1;
				else if (a < b) return -1;
				else return 0;
			});
			$("#names").html(arr);

			// add cursorDiv
			if(gClient.participantId !== part.id || gSeeOwnCursor) {
				var div = document.createElement("div");
				div.className = "cursor";
				div.style.display = "none";
				part.cursorDiv = $("#cursors")[0].appendChild(div);
				$(part.cursorDiv).fadeIn(2000);

				var div = document.createElement("div");
				div.className = "name";
				div.style.backgroundColor = part.color || "#777"
				div.textContent = part.name || "";
				part.cursorDiv.appendChild(div);

			} else {
				part.cursorDiv = undefined;
			}
		});
		gClient.on("participant removed", function(part) {
			// remove nameDiv
			var nd = $(part.nameDiv);
			var cd = $(part.cursorDiv);
			cd.fadeOut(2000);
			nd.fadeOut(2000, function() {
				nd.remove();
				cd.remove();
				part.nameDiv = undefined;
				part.cursorDiv = undefined;
			});
		});
		gClient.on("participant update", function(part) {
			var name = part.name || "";
			var color = part.color || "#777";
			part.nameDiv.style.backgroundColor = color;
			part.nameDiv.textContent = name;
			$(part.cursorDiv)
			.find(".name")
			.text(name)
			.css("background-color", color);
		});
		gClient.on("ch", function(msg) {
			for(var id in gClient.ppl) {
				if(gClient.ppl.hasOwnProperty(id)) {
					var part = gClient.ppl[id];
					if(part.id === gClient.participantId) {
						$(part.nameDiv).addClass("me");
					} else {
						$(part.nameDiv).removeClass("me");
					}
					if(msg.ch.crown && msg.ch.crown.participantId === part.id) {
						$(part.nameDiv).addClass("owner");
						$(part.cursorDiv).addClass("owner");
					} else {
						$(part.nameDiv).removeClass("owner");
						$(part.cursorDiv).removeClass("owner");
					}
					if(gPianoMutes.indexOf(part._id) !== -1) {
						$(part.nameDiv).addClass("muted-notes");
					} else {
						$(part.nameDiv).removeClass("muted-notes");
					}
					if(EXT.draw && EXT.draw.mutes.indexOf(part._id) !== -1){
		                                $(part.nameDiv).addClass("muted-lines");
		                        } else {
						$(part.nameDiv).removeClass("muted-lines");
					}
					if(gChatMutes.indexOf(part._id) !== -1) {
						$(part.nameDiv).addClass("muted-chat");
					} else {
						$(part.nameDiv).removeClass("muted-chat");
					}
				}
			}
		});
	})();


	// Handle changes to crown
	(function() {
		var jqcrown = $('<div id="crown"></div>').appendTo(document.body).hide();
		var jqcountdown = $('<span></span>').appendTo(jqcrown);
		var countdown_interval;
		jqcrown.click(function() {
			gClient.sendArray([{m: "chown", id: gClient.participantId}]);
		});
		gClient.on("ch", function(msg) {
			if(msg.ch.crown) {
				var crown = msg.ch.crown;
				if(!crown.participantId || !gClient.ppl[crown.participantId]) {
					var land_time = crown.time + 2000 - gClient.serverTimeOffset;
					var avail_time = crown.time + 15000 - gClient.serverTimeOffset;
					jqcountdown.text("");
					jqcrown.show();
					if(land_time - Date.now() <= 0) {
						jqcrown.css({"left": crown.endPos.x + "%", "top": crown.endPos.y + "%"});
					} else {
						jqcrown.css({"left": crown.startPos.x + "%", "top": crown.startPos.y + "%"});
						jqcrown.addClass("spin");
						jqcrown.animate({"left": crown.endPos.x + "%", "top": crown.endPos.y + "%"}, 2000, "linear", function() {
							jqcrown.removeClass("spin");
						});
					}
					clearInterval(countdown_interval);
					countdown_interval = setInterval(function() {
						var time = Date.now();
						if(time >= land_time) {
							var ms = avail_time - time;
							if(ms > 0) {
								jqcountdown.text(Math.ceil(ms / 1000) + "s");
							} else {
								jqcountdown.text("");
								clearInterval(countdown_interval);
							}
						}
					}, 1000);
				} else {
					jqcrown.hide();
				}
			} else {
				jqcrown.hide();
			}
		});
		gClient.on("disconnect", function() {
			jqcrown.fadeOut(2000);
		});
	})();

	
	// Playing notes
	gClient.on("n", function(msg) {
		var t = msg.t - gClient.serverTimeOffset + TIMING_TARGET - Date.now();
		var participant = gClient.findParticipantById(msg.p);
		if(gPianoMutes.indexOf(participant._id) !== -1)
			return;
		for(var i = 0; i < msg.n.length; i++) {
			var note = msg.n[i];
			var ms = t + (note.d || 0);
			if(ms < 0) {
				ms = 0;
			}
			else if(ms > 10000) continue;
			if(note.s) {
				gPiano.stop(note.n, participant, ms);
			} else {
				var vel = (typeof note.v !== "undefined")? parseFloat(note.v) : DEFAULT_VELOCITY;
				if(vel < 0) vel = 0; else if (vel > 1) vel = 1;
				gPiano.play(note.n, vel, participant, ms);
				if(enableSynth) {
					gPiano.stop(note.n, participant, ms + 1000);
				}
			}
		}
	});

	// Send cursor updates
	var mx = 0, last_mx = -10, my = 0, last_my = -10;
	setInterval(function() {
		if(Math.abs(mx - last_mx) > 0.1 || Math.abs(my - last_my) > 0.1) {
			last_mx = mx;
			last_my = my;
			gClient.sendArray([{m: "m", x: mx, y: my}]);
			var part = gClient.getOwnParticipant();
			if(part) {
				part.x = mx;
				part.y = my;
			}
		}
	}, 50);
	$(document).mousemove(function(event) {
		mx = ((event.pageX / $(window).width()) * 100).toFixed(2);
		my = ((event.pageY / $(window).height()) * 100).toFixed(2);
	});

	// Animate cursors
	setInterval(function() {
		for(var id in gClient.ppl) {
			if(!gClient.ppl.hasOwnProperty(id)) continue;
			var part = gClient.ppl[id];
			if(part.cursorDiv && (Math.abs(part.x - part.displayX) > 0.1 || Math.abs(part.y - part.displayY) > 0.1)) {
				part.displayX += (part.x - part.displayX) * 0.225;
				part.displayY += (part.y - part.displayY) * 0.225;
				part.cursorDiv.style.left = part.displayX + "%";
				part.cursorDiv.style.top = part.displayY + "%";
			}
		}
	}, 1000 / 60); /* 60 fps */


	// Room settings button
	(function() {
		gClient.on("ch", function(msg) {
			if(gClient.isOwner()) {
				$("#room-settings-btn").show();
			} else {
				$("#room-settings-btn").hide();
			}
		});
		$("#room-settings-btn").click(function(evt) {
			if(gClient.channel && gClient.isOwner()) {
				var settings = gClient.channel.settings;
				openModal("#room-settings");
				setTimeout(function() {
					$("#room-settings .checkbox[name=visible]").prop("checked", settings.visible);
					$("#room-settings .checkbox[name=chat]").prop("checked", settings.chat);
					$("#room-settings .checkbox[name=crownsolo]").prop("checked", settings.crownsolo);
					$("#room-settings input[name=color]").val(settings.color);
				}, 100);
			}
		});
		$("#room-settings .submit").click(function() {
			var settings = {
				visible: $("#room-settings .checkbox[name=visible]").is(":checked"),
				chat: $("#room-settings .checkbox[name=chat]").is(":checked"),
				crownsolo: $("#room-settings .checkbox[name=crownsolo]").is(":checked"),
				color: $("#room-settings input[name=color]").val()
			};
			gClient.sendArray([{m: "chset", set: settings}]);
			closeModal();
		});
		$("#room-settings .drop-crown").click(function() {
			gClient.sendArray([{m: "chown"}]);
			closeModal();
		});
	})();

	// Handle notifications
	gClient.on("notification", function(msg) {
		new Notification(msg);
	});

	// Don't foget spin
	gClient.on("ch", function(msg) {
		var chidlo = msg.ch._id.toLowerCase();
		if(chidlo === "spin" || chidlo.substr(-5) === "/spin") {
			$("#piano").addClass("spin");
		} else {
			$("#piano").removeClass("spin");
		}
	});

	/*function eb() {
		if(gClient.channel && gClient.channel._id.toLowerCase() === "test/fishing") {
			ebsprite.start(gClient);
		} else {
			ebsprite.stop();
		}
	}
	if(ebsprite) {
		gClient.on("ch", eb);
		eb();
	}*/

	// Crownsolo notice
	gClient.on("ch", function(msg) {
		if(msg.ch.settings.crownsolo) {
			if($("#crownsolo-notice").length == 0) {
				$('<div id="crownsolo-notice">').text('This room is set to "only the owner can play."').appendTo("body").fadeIn(1000);
			}
		} else {
			$("#crownsolo-notice").remove();
		}
	});
	gClient.on("disconnect", function() {
		$("#crownsolo-notice").remove();
	});


	// Background color
	(function() {
		var old_color1 = new Color("#242464");
		var old_color2 = new Color("#242464");
		function setColor(hex) {
			var color1 = new Color(hex);
			var color2 = new Color(hex);
			color2.add(-0x40, -0x40, -0x40);

			var bottom = document.getElementById("bottom");
			
			var duration = 500;
			var step = 0;
			var steps = 30;
			var step_ms = duration / steps;
			var difference = new Color(color1.r, color1.g, color1.b);
			difference.r -= old_color1.r;
			difference.g -= old_color1.g;
			difference.b -= old_color1.b;
			var inc = new Color(difference.r / steps, difference.g / steps, difference.b / steps);
			var iv;
			iv = setInterval(function() {
				old_color1.add(inc.r, inc.g, inc.b);
				old_color2.add(inc.r, inc.g, inc.b);
				document.body.style.background = "radial-gradient(ellipse at center, "+old_color1.toHexa()+" 0%,"+old_color2.toHexa()+" 100%)";
				bottom.style.background = old_color2.toHexa();
				gPiano.color = +("0x" + old_color2.toHexa().slice(1));
				//console.log("0x" + old_color2.toHexa().slice(1));
				if(++step >= steps) {
					clearInterval(iv);
					old_color1 = color1;
					old_color2 = color2;
					document.body.style.background = "radial-gradient(ellipse at center, "+color1.toHexa()+" 0%,"+color2.toHexa()+" 100%)";
					bottom.style.background = color2.toHexa();
					gPiano.color = +("0x" + color2.toHexa().slice(1));
				}
			}, step_ms);
		}

		setColor("#242464");

		gClient.on("ch", function(ch) {
			if(ch.ch.settings) {
				if(ch.ch.settings.color) {
					setColor(ch.ch.settings.color);
				} else {
					setColor("#242464");
				}
			}
		});
	})();






	var gPianoMutes = [];

	var gChatMutes = [];


 	









	

	
	



	var volume_slider = new VolumeSlider(document.getElementById("volume"), function(v) {
		gPiano.audio.setVolume(v);
		if(window.localStorage) localStorage.volume = v;
	});
	volume_slider.set(gPiano.audio.volume);

	var Note = function(note, octave) {
		this.note = note;
		this.octave = octave || 0;
	};



	var n = function(a, b) { return {note: new Note(a, b), held: false}; };
	gPiano.key_binding = {
		65: n("gs"),
		90: n("a"),
		83: n("as"),
		88: n("b"),
		67: n("c", 1),
		70: n("cs", 1),
		86: n("d", 1),
		71: n("ds", 1),
		66: n("e", 1),
		78: n("f", 1),
		74: n("fs", 1),
		77: n("g", 1),
		75: n("gs", 1),
		188: n("a", 1),
		76: n("as", 1),
		190: n("b", 1),
		191: n("c", 2),
		222: n("cs", 2),

		49: n("gs", 1),
		81: n("a", 1),
		50: n("as", 1),
		87: n("b", 1),
		69: n("c", 2),
		52: n("cs", 2),
		82: n("d", 2),
		53: n("ds", 2),
		84: n("e", 2),
		89: n("f", 2),
		55: n("fs", 2),
		85: n("g", 2),
		56: n("gs", 2),
		73: n("a", 2),
		57: n("as", 2),
		79: n("b", 2),
		80: n("c", 3),
		189: n("cs", 3),
		219: n("d", 3),
		187: n("ds", 3),
		221: n("e", 3)
	};

	var capsLockKey = false;

	var transpose_octave = 0;
	
	function handleKeyDown(evt) {
		//console.log(evt);
		var code = parseInt(evt.keyCode);
		if(gPiano.key_binding[code] !== undefined) {
			var binding = gPiano.key_binding[code];
			if(!binding.held) {
				binding.held = true;

				var note = binding.note;
				var octave = 1 + note.octave + transpose_octave;
				if(evt.shiftKey) ++octave;
				else if(capsLockKey || evt.ctrlKey) --octave;
				note = note.note + octave;
				var vol = velocityFromMouseY();
				press(note, vol);
			}

			if(++gKeyboardSeq == 3) {
				gKnowsYouCanUseKeyboard = true;
				if(window.gKnowsYouCanUseKeyboardTimeout) clearTimeout(gKnowsYouCanUseKeyboardTimeout);
				if(localStorage) localStorage.knowsYouCanUseKeyboard = true;
				if(window.gKnowsYouCanUseKeyboardNotification) gKnowsYouCanUseKeyboardNotification.close();
			}

			evt.preventDefault();
			evt.stopPropagation();
			return false;
		} else if(code == 20) { // Caps Lock
			capsLockKey = true;
			evt.preventDefault();
		} else if(code === 0x20) { // Space Bar
			pressSustain();
			evt.preventDefault();
		} else if((code === 38 || code === 39) && transpose_octave < 3) {
			++transpose_octave;
		} else if((code === 40 || code === 37) && transpose_octave > -2) {
			--transpose_octave;
		} else if(code == 9) { // Tab (don't tab away from the piano)
			evt.preventDefault();
		} else if(code == 8) { // Backspace (don't navigate Back)
			gSustain = !gSustain;
			evt.preventDefault();
		}
	};

	function handleKeyUp(evt) {
		var code = parseInt(evt.keyCode);
		if(gPiano.key_binding[code] !== undefined) {
			var binding = gPiano.key_binding[code];
			if(binding.held) {
				binding.held = false;
				
				var note = binding.note;
				var octave = 1 + note.octave + transpose_octave;
				if(evt.shiftKey) ++octave;
				else if(capsLockKey || evt.ctrlKey) --octave;
				note = note.note + octave;
				release(note);
			}

			evt.preventDefault();
			evt.stopPropagation();
			return false;
		} else if(code == 20) { // Caps Lock
			capsLockKey = false;
			evt.preventDefault();
		} else if(code === 0x20) { // Space Bar
			releaseSustain();
			evt.preventDefault();
		}
	};

	function handleKeyPress(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		if(evt.keyCode == 27 || evt.keyCode == 13) {
			//$("#chat input").focus();
		}
		return false;
	};

	var recapListener = function(evt) {
		captureKeyboard();
	};

	function captureKeyboard() {
		$("#piano").off("mousedown", recapListener);
		$("#piano").off("touchstart", recapListener);
		$(document).on("keydown", handleKeyDown );
		$(document).on("keyup", handleKeyUp);
		$(window).on("keypress", handleKeyPress );
	};

	function releaseKeyboard() {
		$(document).off("keydown", handleKeyDown );
		$(document).off("keyup", handleKeyUp);
		$(window).off("keypress", handleKeyPress );
		$("#piano").on("mousedown", recapListener);
		$("#piano").on("touchstart", recapListener);
	};

	captureKeyboard();


	var velocityFromMouseY = function() {
		return 0.1 + (my / 100) * 0.6;
	};





	// NoteQuota
	var gNoteQuota = (function() {
		var last_rat = 0;
		var nqjq = $("#quota .value");
		setInterval(function() {
			gNoteQuota.tick();
		}, 2000);
		return new NoteQuota(function(points) {
			// update UI
			var rat = (points / this.max) * 100;
			if(rat <= last_rat)
				nqjq.stop(true, true).css("width", rat.toFixed(0) + "%");
			else
				nqjq.stop(true, true).animate({"width": rat.toFixed(0) + "%"}, 2000, "linear");
			last_rat = rat;
		});
	})();
	gClient.on("nq", function(nq_params) {
		gNoteQuota.setParams(nq_params);
	});
	gClient.on("disconnect", function() {
		gNoteQuota.setParams(NoteQuota.PARAMS_OFFLINE);
	});



	// click participant names
	(function() {
		var ele = document.getElementById("names");
		var touchhandler = function(e) {
			var target_jq = $(e.target);
			if(target_jq.hasClass("name")) {
				target_jq.addClass("play");
				if(e.target.participantId == gClient.participantId) {
					openModal("#rename", "input[name=name]");
					setTimeout(function() {
						$("#rename input[name=name]").val(gClient.ppl[gClient.participantId].name);
						$("#rename input[name=color]").val(gClient.ppl[gClient.participantId].color);
					}, 100);
				} else if(e.target.participantId) {
					var id = e.target.participantId;
					var part = gClient.ppl[id] || null;
					if(part) {
						participantMenu(part);
						e.stopPropagation();
					}
				}
			}
		};
		ele.addEventListener("mousedown", touchhandler);
		ele.addEventListener("touchstart", touchhandler);
		var releasehandler = function(e) {
			$("#names .name").removeClass("play");
		};
		document.body.addEventListener("mouseup", releasehandler);
		document.body.addEventListener("touchend", releasehandler);

		var removeParticipantMenus = function() {
			$(".participant-menu").remove();
			$(".participantSpotlight").hide();
			document.removeEventListener("mousedown", removeParticipantMenus);
			document.removeEventListener("touchstart", removeParticipantMenus);
		};

		var participantMenu = function(part) {
			if(!part) return;
			removeParticipantMenus();
			document.addEventListener("mousedown", removeParticipantMenus);
			document.addEventListener("touchstart", removeParticipantMenus);
			$("#" + part.id).find(".enemySpotlight").show();
			var menu = $('<div class="participant-menu"></div>');
			$("body").append(menu);
			// move menu to name position
			var jq_nd = $(part.nameDiv);
			var pos = jq_nd.position();
			var leftadj = pos.left + 6;
			leftadj = leftadj + 150 > window.innerWidth ? pos.left - jq_nd[0].offsetWidth + 6 : leftadj;
			menu.css({
				"top": pos.top + jq_nd.height() + 15,
				"left": leftadj,
				"background": part.color || "black"
			});
			menu.on("mousedown touchstart", function(evt) {
				evt.stopPropagation();
				var target = $(evt.target);
				if(target.hasClass("menu-item")) {
					target.addClass("clicked");
					menu.fadeOut(200, function() {
						removeParticipantMenus();
					});
				}
			});
			// this spaces stuff out but also can be used for informational
			$('<div class="info"></div>').appendTo(menu).text(part._id);
			// add menu items
			if(gPianoMutes.indexOf(part._id) == -1) {
				$('<div class="menu-item">Mute Notes</div>').appendTo(menu)
				.on("mousedown touchstart", function(evt) {
					gPianoMutes.push(part._id);
					$(part.nameDiv).addClass("muted-notes");
				});
			} else {
				$('<div class="menu-item">Unmute Notes</div>').appendTo(menu)
				.on("mousedown touchstart", function(evt) {
					var i;
					while((i = gPianoMutes.indexOf(part._id)) != -1)
						gPianoMutes.splice(i, 1);
					$(part.nameDiv).removeClass("muted-notes");
				});
			}
			if(EXT.draw){
				if(EXT.draw.mutes.indexOf(part._id) == -1) {
					$('<div class="menu-item">Mute Lines</div>').appendTo(menu)
					.on("mousedown touchstart", function(evt) {
						EXT.draw.mutes.push(part._id);
						$(part.nameDiv).addClass("muted-lines");
					});
				} else {
					$('<div class="menu-item">Unmute Lines</div>').appendTo(menu)
					.on("mousedown touchstart", function(evt) {
						var i;
						while((i = EXT.draw.mutes.indexOf(part._id)) != -1)
							EXT.draw.mutes.splice(i, 1);
						$(part.nameDiv).removeClass("muted-lines");
					});
				}
			}
			if(gChatMutes.indexOf(part._id) == -1) {
				$('<div class="menu-item">Mute Chat</div>').appendTo(menu)
				.on("mousedown touchstart", function(evt) {
					gChatMutes.push(part._id);
					$(part.nameDiv).addClass("muted-chat");
				});
			} else {
				$('<div class="menu-item">Unmute Chat</div>').appendTo(menu)
				.on("mousedown touchstart", function(evt) {
					var i;
					while((i = gChatMutes.indexOf(part._id)) != -1)
						gChatMutes.splice(i, 1);
					$(part.nameDiv).removeClass("muted-chat");
				});
			}
			if(!(gPianoMutes.indexOf(part._id) >= 0) || !(gChatMutes.indexOf(part._id) >= 0) || !(EXT.draw && EXT.draw.mutes.indexOf(part._id) >= 0)) {
				$('<div class="menu-item">Mute Completely</div>').appendTo(menu)
				.on("mousedown touchstart", function(evt) {
					gPianoMutes.push(part._id);
					gChatMutes.push(part._id);
					if(EXT.draw){
						EXT.draw.mutes.push(part._id);
						$(part.nameDiv).addClass("muted-lines");
					}
					$(part.nameDiv).addClass("muted-notes");
					$(part.nameDiv).addClass("muted-chat");
				});
			}
			if((gPianoMutes.indexOf(part._id) >= 0) || (gChatMutes.indexOf(part._id) >= 0) || (EXT.draw && EXT.draw.mutes.indexOf(part._id) >= 0)) {
				$('<div class="menu-item">Unmute Completely</div>').appendTo(menu)
				.on("mousedown touchstart", function(evt) {
					var i;
					while((i = gPianoMutes.indexOf(part._id)) != -1)
						gPianoMutes.splice(i, 1);
					while((i = gChatMutes.indexOf(part._id)) != -1)
						gChatMutes.splice(i, 1);
					if(EXT.draw){
						while((i = EXT.draw.mutes.indexOf(part._id)) != -1)
                                                        EXT.draw.mutes.splice(i, 1);
                                                $(part.nameDiv).removeClass("muted-lines");
					}
					$(part.nameDiv).removeClass("muted-notes");
					$(part.nameDiv).removeClass("muted-chat");
				});
			}
			if(gClient.isOwner()) {
				$('<div class="menu-item give-crown">Give Crown</div>').appendTo(menu)
				.on("mousedown touchstart", function(evt) {
					gClient.sendArray([{m: "chown", id: part.id}]);
				});
				$('<div class="menu-item kickban">Kickban</div>').appendTo(menu)
				.on("mousedown touchstart", function(evt) {
					var minutes = prompt("How many minutes? (0-60)", "30");
					if(minutes === null) return;
					minutes = parseFloat(minutes) || 0;
					var ms = minutes * 60 * 1000;
					gClient.sendArray([{m: "kickban", _id: part._id, ms: ms}]);
				});
			}
			menu.fadeIn(100);
		};
	})();
	















// Notification class

////////////////////////////////////////////////////////////////

	var Notification = function(par) {
		EventEmitter.call(this);

		var par = par || {};

		this.id = "Notification-" + (par.id || Math.random());
		this.title = par.title || "";
		this.text = par.text || "";
		this.html = par.html || "";
		this.target = $(par.target || "#piano");
		this.duration = par.duration || 30000;
		this["class"] = par["class"] || "classic";
		
		var self = this;
		var eles = $("#" + this.id);
		if(eles.length > 0) {
			eles.remove();
		}
		this.domElement = $('<div class="notification"><div class="notification-body"><div class="title"></div>' +
			'<div class="text"></div></div><div class="x">x</div></div>');
		this.domElement[0].id = this.id;
		this.domElement.addClass(this["class"]);
		this.domElement.find(".title").text(this.title);
		if(this.text.length > 0) {
			this.domElement.find(".text").text(this.text);
		} else if(this.html instanceof HTMLElement) {
			this.domElement.find(".text")[0].appendChild(this.html);
		} else if(this.html.length > 0) {
			this.domElement.find(".text").html(this.html);
		}
		$(this.domElement).css('display', 'none');
		document.body.appendChild(this.domElement.get(0));
		$(this.domElement).fadeIn(75);
		
		this.position();
		this.onresize = function() {
			self.position();
		};
		window.addEventListener("resize", this.onresize);

		this.domElement.find(".x").click(function() {
			self.close();
		});

		if(this.duration > 0) {
			setTimeout(function() {
				self.close();
			}, this.duration);
		}

		return this;
	}

	mixin(Notification.prototype, EventEmitter.prototype);
	Notification.prototype.constructor = Notification;

	Notification.prototype.position = function() {
		var pos = this.target.offset();
		var x = pos.left - (this.domElement.width() / 2) + (this.target.width() / 4);
		var y = pos.top - this.domElement.height() - 8;
		var width = this.domElement.width();
		if(x + width > $("body").width()) {
			x -= ((x + width) - $("body").width());
		}
		if(x < 0) x = 0;
		this.domElement.offset({left: x, top: y});
	};

	Notification.prototype.close = function() {
		var self = this;
		window.removeEventListener("resize",  this.onresize);
		this.domElement.fadeOut(500, function() {
			self.domElement.remove();
			self.emit("close");
		});
	};















// set variables from settings or set settings

////////////////////////////////////////////////////////////////

	var gKeyboardSeq = 0;
	var gKnowsYouCanUseKeyboard = false;
	var gKnowsYouCanDrawWithShiftAndClick = false;
	if(localStorage && localStorage.knowsYouCanUseKeyboard) gKnowsYouCanUseKeyboard = true;
	if(localStorage && localStorage.knowsYouCanDrawWithShiftAndClick) gKnowsYouCanDrawWithShiftAndClick = true;
	if(!gKnowsYouCanUseKeyboard) {
		window.gKnowsYouCanUseKeyboardTimeout = setTimeout(function() {
			window.gKnowsYouCanUseKeyboardNotification = new Notification({title: "Did you know!?!",
				text: "You can play the piano with your keyboard, too.  Try it!", target: "#piano", duration: 10000});
		}, 30000);
	}
	if(!gKnowsYouCanDrawWithShiftAndClick){
		window.gKnowsYouCanDrawWithShiftAndClickTimeout = setTimeout(function(){
			gKnowsYouCanDrawWithShiftAndClick = true;
			if(localStorage) localStorage.knowsYouCanDrawWithShiftAndClick = true;
			window.gKnowsYouCanDrawWithShiftAndClickNotification = new Notification({title: "DID YOU KNOW?!?!?!",
				text: "You can draw on the screen with shift + click (and drag)! Other players will see it. Try it!", target: "#piano", duration: 10000});
		}, 50000);
	}



	if(window.localStorage) {

		if(localStorage.volume) {
			volume_slider.set(localStorage.volume);
			gPiano.audio.setVolume(localStorage.volume);
		}
		else localStorage.volume = gPiano.audio.volume;

		window.gHasBeenHereBefore = (localStorage.gHasBeenHereBefore || false);
		if(gHasBeenHereBefore) {
		}
		localStorage.gHasBeenHereBefore = true;
		
	}













// New room, change room

////////////////////////////////////////////////////////////////

	$("#room > .info").text("--");
	gClient.on("ch", function(msg) {
		var channel = msg.ch;
		var info = $("#room > .info");
		info.text(channel._id);
		if(channel.settings.lobby) info.addClass("lobby");
		else info.removeClass("lobby");
		if(!channel.settings.chat) info.addClass("no-chat");
		else info.removeClass("no-chat");
		if(channel.settings.crownsolo) info.addClass("crownsolo");
		else info.removeClass("crownsolo");
		if(!channel.settings.visible) info.addClass("not-visible");
		else info.removeClass("not-visible");
	});
	gClient.on("ls", function(ls) {
		for(var i in ls.u) {
			if(!ls.u.hasOwnProperty(i)) continue;
			var room = ls.u[i];
			var info = $("#room .info[roomname=\"" + (room._id + '').replace(/[\\"']/g, '\\$&').replace(/\u0000/g, '\\0') + "\"]");
			if(info.length == 0) {
				info = $("<div class=\"info\"></div>");
				info.attr("roomname", room._id);
				$("#room .more").append(info);
			}
			info.text(room._id + " (" + room.count + ")");
			if(room.settings.lobby) info.addClass("lobby");
			else info.removeClass("lobby");
			if(!room.settings.chat) info.addClass("no-chat");
			else info.removeClass("no-chat");
			if(room.settings.crownsolo) info.addClass("crownsolo");
			else info.removeClass("crownsolo");
			if(!room.settings.visible) info.addClass("not-visible");
			else info.removeClass("not-visible");
			if(room.banned) info.addClass("banned");
			else info.removeClass("banned")
		}
	});
	$("#room").on("click", function(evt) {
		evt.stopPropagation();

		// clicks on a new room
		if($(evt.target).hasClass("info") && $(evt.target).parents(".more").length) {
			$("#room .more").fadeOut(250);
			var selected_name = $(evt.target).attr("roomname");
			if(typeof selected_name != "undefined") {
				changeRoom(selected_name, "right");
			}
			return false;
		}
		// clicks on "New Room..."
		else if($(evt.target).hasClass("new")) {
			openModal("#new-room", "input[name=name]");
		}
		// all other clicks
		var doc_click = function(evt) {
			if($(evt.target).is("#room .more")) return;
			$(document).off("mousedown", doc_click);
			$("#room .more").fadeOut(250);
			gClient.sendArray([{m: "-ls"}]);
		}
		$(document).on("mousedown", doc_click);
		$("#room .more .info").remove();
		$("#room .more").show();
		gClient.sendArray([{m: "+ls"}]);
	});
	$("#new-room-btn").on("click", function(evt) {
		evt.stopPropagation();
		openModal("#new-room", "input[name=name]");
	});


	$("#play-alone-btn").on("click", function(evt) {
		evt.stopPropagation();
		var room_name = "Room" + Math.floor(Math.random() * 1000000000000);
		changeRoom(room_name, "right", {"visible": false, "chat": true, "crownsolo": false});
/*		setTimeout(function() {
			new Notification({id: "share", title: "Playing alone", html: 'You are playing alone in a room by yourself, but you can always invite \
				friends by sending them the link.<br/><br/>\
				<a href="#" onclick="window.open(\'https://www.facebook.com/sharer/sharer.php?u=\'+encodeURIComponent(location.href),\'facebook-share-dialog\',\'width=626,height=436\');return false;">Share on Facebook</a><br/><br/>\
				<a href="http://twitter.com/home?status='+encodeURIComponent(location.href)+'" target="_blank">Tweet</a>', duration: 25000});
		}, 1000);*/
	});

	

	var gModal;

	function modalHandleEsc(evt) {
		if(evt.keyCode == 27) {
			closeModal();
			evt.preventDefault();
			evt.stopPropagation();
		}
	};
	
	function openModal(selector, focus) {
		MPP.chat.blur();
		releaseKeyboard();
		$(document).on("keydown", modalHandleEsc);
		$("#modal #modals > *").hide();
		$("#modal").fadeIn(250);
		$(selector).show();
		setTimeout(function() {
			$(selector).find(focus).focus();
		}, 100);
		gModal = selector;
	};

	function closeModal() {
		$(document).off("keydown", modalHandleEsc);
		$("#modal").fadeOut(100);
		$("#modal #modals > *").hide();
		captureKeyboard();
		gModal = null;
	};

	var modal_bg = $("#modal .bg")[0];
	$(modal_bg).on("click", function(evt) {
		if(evt.target != modal_bg) return;
		closeModal();
	});

	(function() {
		function submit() {
			var name = $("#new-room .text[name=name]").val();
			var settings = {
				visible: $("#new-room .checkbox[name=visible]").is(":checked"),
				chat: true,
				crownsolo: false
			};
			$("#new-room .text[name=name]").val("");
			closeModal();
			changeRoom(name, "right", settings);
			/*setTimeout(function() {
			new Notification({id: "share", title: "Created a Room", html: 'You can invite friends to your room by sending them the link.<br/><br/>\
				<a href="#" onclick="window.open(\'https://www.facebook.com/sharer/sharer.php?u=\'+encodeURIComponent(location.href),\'facebook-share-dialog\',\'width=626,height=436\');return false;">Share on Facebook</a><br/><br/>\
				<a href="http://twitter.com/home?status='+encodeURIComponent(location.href)+'" target="_blank">Tweet</a>', duration: 25000});
		}, 1000);*/
		};
		$("#new-room .submit").click(function(evt) {
			submit();
		});
		$("#new-room .text[name=name]").keypress(function(evt) {
			if(evt.keyCode == 13) {
				submit();
			} else if(evt.keyCode == 27) {
				closeModal();
			} else {
				return;
			}
			evt.preventDefault();
			evt.stopPropagation();
			return false;
		});
	})();



	




	function changeRoom(name, direction, settings, push) {
		if(!settings) settings = {};
		if(!direction) direction = "right";
		if(typeof push == "undefined") push = true;
		var opposite = direction == "left" ? "right" : "left";

		if(name == "") name = "lobby";
		if(gClient.channel && gClient.channel._id === name) return;
		if(push) {
			var url = "/" + encodeURIComponent(name).replace("'", "%27");
			if(window.history && history.pushState) {
				history.pushState({"depth": gHistoryDepth += 1, "name": name}, "Piano > " + name, url);
			} else {
				window.location = url;
				return;
			}
		}
		
		gClient.setChannel(name, settings);

		var t = 0, d = 100;
		$("#piano").addClass("ease-out").addClass("slide-" + opposite);
		setTimeout(function() {
			$("#piano").removeClass("ease-out").removeClass("slide-" + opposite).addClass("slide-" + direction);
		}, t += d);
		setTimeout(function() {
			$("#piano").addClass("ease-in").removeClass("slide-" + direction);
		}, t += d);
		setTimeout(function() {
			$("#piano").removeClass("ease-in");
		}, t += d);
	};

	var gHistoryDepth = 0;
	$(window).on("popstate", function(evt) {
		var depth = evt.state ? evt.state.depth : 0;
		if(depth == gHistoryDepth) return; // <-- forgot why I did that though...
		
		var direction = depth <= gHistoryDepth ? "left" : "right";
		gHistoryDepth = depth;

		var name = decodeURIComponent(window.location.pathname);
		if(name.substr(0, 1) == "/") name = name.substr(1);
		changeRoom(name, direction, null, false);
	});




















// Rename

////////////////////////////////////////////////////////////////

(function() {
		function submit() {
			var set = {
				name: $("#rename input[name=name]").val(),
				color: $("#rename input[name=color]").val()
			};
			//$("#rename .text[name=name]").val("");
			closeModal();
			gClient.sendArray([{m: "userset", set: set}]);
		};
		$("#rename .submit").click(function(evt) {
			submit();
		});
		$("#rename .text[name=name]").keypress(function(evt) {
			if(evt.keyCode == 13) {
				submit();
			} else if(evt.keyCode == 27) {
				closeModal();
			} else {
				return;
			}
			evt.preventDefault();
			evt.stopPropagation();
			return false;
		});
	})();















// chatctor

////////////////////////////////////////////////////////////////

	var chat = (function() {
		gClient.on("ch", function(msg) {
			if(msg.ch.settings.chat) {
				chat.show();
			} else {
				chat.hide();
			}
		});
		gClient.on("disconnect", function(msg) {
			chat.hide();
		});
		gClient.on("c", function(msg) {
			chat.clear();
			if(msg.c) {
				for(var i = 0; i < msg.c.length; i++) {
					chat.receive(msg.c[i]);
				}
			}
		});
		gClient.on("a", function(msg) {
			chat.receive(msg);
		});

		$("#chat input").on("focus", function(evt) {
			releaseKeyboard();
			$("#chat").addClass("chatting");
			chat.scrollToBottom();
		});
		/*$("#chat input").on("blur", function(evt) {
			captureKeyboard();
			$("#chat").removeClass("chatting");
			chat.scrollToBottom();
		});*/
		$(document).mousedown(function(evt) {
			if(!$("#chat").has(evt.target).length > 0) {
				chat.blur();
			}
		});
		document.addEventListener("touchstart", function(event) {
			for(var i in event.changedTouches) {
				var touch = event.changedTouches[i];
				if(!$("#chat").has(touch.target).length > 0) {
					chat.blur();
				}
			}
		});
		$(document).on("keydown", function(evt) {
			if($("#chat").hasClass("chatting")) {
				if(evt.keyCode == 27) {
					chat.blur();
					evt.preventDefault();
					evt.stopPropagation();
				} else if(evt.keyCode == 13) {
					$("#chat input").focus();
				}
			} else if(!gModal && (evt.keyCode == 27 || evt.keyCode == 13)) {
				$("#chat input").focus();
			}
		});
		$("#chat input").on("keydown", function(evt) {
			if(evt.keyCode == 13) {
				var message = $(this).val();
				if(message.length == 0) {
					setTimeout(function() {
						chat.blur();
					}, 100);
				} else if(message.length <= 512) {
					chat.send(message);
					$(this).val("");
					setTimeout(function() {
						chat.blur();
					}, 100);
				}
				evt.preventDefault();
				evt.stopPropagation();
			} else if(evt.keyCode == 27) {
				chat.blur();
				evt.preventDefault();
				evt.stopPropagation();
			} else if(evt.keyCode == 9) {
				evt.preventDefault();
				evt.stopPropagation();
			}
		});

		return {
			show: function() {
				$("#chat").fadeIn();
			},

			hide: function() {
				$("#chat").fadeOut();
			},

			clear: function() {
				$("#chat li").remove();
			},

			scrollToBottom: function() {
				var ele = $("#chat ul").get(0);
				ele.scrollTop = ele.scrollHeight;
			},

			blur: function() {
				if($("#chat").hasClass("chatting")) {
					$("#chat input").get(0).blur();
					$("#chat").removeClass("chatting");
					chat.scrollToBottom();
					captureKeyboard();
				}
			},

			send: function(message) {
				gClient.sendArray([{m:"a", message: message}]);
			},

			receive: function(msg) {
				if(gChatMutes.indexOf(msg.p._id) != -1) return;

				var li = $('<li><span class="name"/><span class="message"/>');

				li.find(".name").text(msg.p.name + ":");
				li.find(".message").text(msg.a);
				li.css("color", msg.p.color || "white");

				$("#chat ul").append(li);

				var eles = $("#chat ul li").get();
				for(var i = 1; i <= 50 && i <= eles.length; i++) {
					eles[eles.length - i].style.opacity = 1.0 - (i * 0.03);
				}
				if(eles.length > 50) {
					eles[0].style.display = "none";
				}
				if(eles.length > 256) {
					$(eles[0]).remove();
				}

				// scroll to bottom if not "chatting" or if not scrolled up
				if(!$("#chat").hasClass("chatting")) {
					chat.scrollToBottom();
				} else {
					var ele = $("#chat ul").get(0);
					if(ele.scrollTop > ele.scrollHeight - ele.offsetHeight - 50)
						chat.scrollToBottom();
				}
			}
		};
	})();
	














// MIDI

////////////////////////////////////////////////////////////////

	var MIDI_TRANSPOSE = -12;
	var MIDI_KEY_NAMES = ["a-1", "as-1", "b-1"];
	var bare_notes = "c cs d ds e f fs g gs a as b".split(" ");
	for(var oct = 0; oct < 7; oct++) {
		for(var i in bare_notes) {
			MIDI_KEY_NAMES.push(bare_notes[i] + oct);
		}
	}
	MIDI_KEY_NAMES.push("c7");

	(function() {
		gClient.velVolume = 1;
		if (navigator.requestMIDIAccess) {
			navigator.requestMIDIAccess().then(
				function(midi) {
					// console.log(midi);
					function midimessagehandler(evt) {
						if(!evt.target.enabled) return;
						//console.log(evt);
						var channel = evt.data[0] & 0xf;
						var cmd = evt.data[0] >> 4;
						var note_number = evt.data[1];
						var vel = evt.data[2];
						//console.log(channel, cmd, note_number, vel);
						if(cmd == 8 || (cmd == 9 && vel == 0)) {
							// NOTE_OFF
							release(MIDI_KEY_NAMES[note_number - 9 + MIDI_TRANSPOSE]);
						} else if(cmd == 9) {
							// NOTE_ON
							if (channel != 9) {
								press(MIDI_KEY_NAMES[note_number - 9 + MIDI_TRANSPOSE], Math.min(vel / 100 * gClient.velVolume, 1));
							}
						} else if(cmd == 11) {
							// CONTROL_CHANGE
							if(note_number == 64) {
								if(vel >= 64) {
									pressSustain();
								} else {
									releaseSustain();
								}
							} else if (note_number == 7) {
								volume_slider.set(vel / 127);
								gPiano.audio.setVolume(vel / 127);
								if(window.localStorage) localStorage.volume = vel / 127;
							} else if (note_number == 3) {
								gClient.velVolume = vel / 127 * 2;
							}
						}
					}

					function plug() {
						if(midi.inputs.size > 0) {
							var inputs = midi.inputs.values();
							for(var input_it = inputs.next(); input_it && !input_it.done; input_it = inputs.next()) {
								var input = input_it.value;
								//input.removeEventListener("midimessage", midimessagehandler);
								//input.addEventListener("midimessage", midimessagehandler);
								input.onmidimessage = midimessagehandler;
								if(input.enabled !== false) {
									input.enabled = true;
								}
								// console.log("input", input);
							}
						}
						if(midi.outputs.size > 0) {
							var outputs = midi.outputs.values();
							for(var output_it = outputs.next(); output_it && !output_it.done; output_it = outputs.next()) {
								var output = output_it.value;
								//output.enabled = false; // edit: don't touch
								// console.log("output", output);
							}
							gMidiOutTest = function(note_name, vel, delay_ms) {
								var note_number = MIDI_KEY_NAMES.indexOf(note_name);
								if(note_number == -1) return;
								note_number = note_number + 9 - MIDI_TRANSPOSE;

								var outputs = midi.outputs.values();
								for(var output_it = outputs.next(); output_it && !output_it.done; output_it = outputs.next()) {
									var output = output_it.value;
									if(output.enabled) {
										output.send([0x90, note_number, vel], window.performance.now() + delay_ms);
									}
								}
							}
						}
						showConnections(false);
					}

					midi.addEventListener("statechange", function(evt) {
						if(evt instanceof MIDIConnectionEvent) {
							plug();
						}
					});

					plug();


					var connectionsNotification;

					function showConnections(sticky) {
						//if(document.getElementById("Notification-MIDI-Connections"))
							//sticky = 1; // todo: instead, 
						var inputs_ul = document.createElement("ul");
						if(midi.inputs.size > 0) {
							var inputs = midi.inputs.values();
							for(var input_it = inputs.next(); input_it && !input_it.done; input_it = inputs.next()) {
								var input = input_it.value;
								var li = document.createElement("li");
								li.connectionId = input.id;
								li.classList.add("connection");
								if(input.enabled) li.classList.add("enabled");
								li.textContent = input.name;
								li.addEventListener("click", function(evt) {
									var inputs = midi.inputs.values();
									for(var input_it = inputs.next(); input_it && !input_it.done; input_it = inputs.next()) {
										var input = input_it.value;
										if(input.id === evt.target.connectionId) {
											input.enabled = !input.enabled;
											evt.target.classList.toggle("enabled");
											// console.log("click", input);
											return;
										}
									}
								});
								inputs_ul.appendChild(li);
							}
						} else {
							inputs_ul.textContent = "(none)";
						}
						var outputs_ul = document.createElement("ul");
						if(midi.outputs.size > 0) {
							var outputs = midi.outputs.values();
							for(var output_it = outputs.next(); output_it && !output_it.done; output_it = outputs.next()) {
								var output = output_it.value;
								var li = document.createElement("li");
								li.connectionId = output.id;
								li.classList.add("connection");
								if(output.enabled) li.classList.add("enabled");
								li.textContent = output.name;
								li.addEventListener("click", function(evt) {
									var outputs = midi.outputs.values();
									for(var output_it = outputs.next(); output_it && !output_it.done; output_it = outputs.next()) {
										var output = output_it.value;
										if(output.id === evt.target.connectionId) {
											output.enabled = !output.enabled;
											evt.target.classList.toggle("enabled");
											// console.log("click", output);
											return;
										}
									}
								});
								outputs_ul.appendChild(li);
							}
						} else {
							outputs_ul.textContent = "(none)";
						}
						var div = document.createElement("div");
						var h1 = document.createElement("h1");
						h1.textContent = "Inputs";
						div.appendChild(h1);
						div.appendChild(inputs_ul);
						h1 = document.createElement("h1");
						h1.textContent = "Outputs";
						div.appendChild(h1);
						div.appendChild(outputs_ul);
						connectionsNotification = new Notification({"id":"MIDI-Connections", "title":"MIDI Connections","duration":sticky?"-1":"4500","html":div,"target":"#midi-btn"});
					}

					document.getElementById("midi-btn").addEventListener("click", function(evt) {
						if(!document.getElementById("Notification-MIDI-Connections"))
							showConnections(true);
						else {
							connectionsNotification.close();
						}
					});
				},
				function(err){
					console.log(err);
				} );
		}
	})();

	// API
	window.MPP = {
		get press() { return press },
		set press(func) { press = func },
		get release() { return release },
		set release(func) { release = func },
		piano: gPiano,
		client: gClient,
		chat: chat,
		noteQuota: gNoteQuota,
		soundSelector: gSoundSelector
	};

	// record mp3
	// (function() {
	// 	var button = document.querySelector("#record-btn");
	// 	var audio = MPP.piano.audio;
	// 	var context = audio.context;
	// 	var encoder_sample_rate = 44100;
	// 	var encoder_kbps = 128;
	// 	var encoder = null;
	// 	var scriptProcessorNode = context.createScriptProcessor(4096, 2, 2);
	// 	var recording = false;
	// 	var recording_start_time = 0;
	// 	var mp3_buffer = [];
	// 	button.addEventListener("click", function(evt) {
	// 		if(!recording) {
	// 			// start recording
	// 			mp3_buffer = [];
	// 			encoder = new lamejs.Mp3Encoder(2, encoder_sample_rate, encoder_kbps);
	// 			scriptProcessorNode.onaudioprocess = onAudioProcess;
	// 			audio.masterGain.connect(scriptProcessorNode);
	// 			scriptProcessorNode.connect(context.destination);
	// 			recording_start_time = Date.now();
	// 			recording = true;
	// 			button.textContent = "Stop Recording";
	// 			button.classList.add("stuck");
	// 			new Notification({"id": "mp3", "title": "Recording MP3...", "html": "It's recording now.  This could make things slow, maybe.  Maybe give it a moment to settle before playing.<br><br>This feature is experimental.<br>Send complaints to <a href=\"mailto:multiplayerpiano.com@gmail.com\">multiplayerpiano.com@gmail.com</a>.", "duration": 10000});
	// 		} else {
	// 			// stop recording
	// 			var mp3buf = encoder.flush();
	// 			mp3_buffer.push(mp3buf);
	// 			var blob = new Blob(mp3_buffer, {type: "audio/mp3"});
	// 			var url = URL.createObjectURL(blob);
	// 			scriptProcessorNode.onaudioprocess = null;
	// 			audio.masterGain.disconnect(scriptProcessorNode);
	// 			scriptProcessorNode.disconnect(context.destination);
	// 			recording = false;
	// 			button.textContent = "Record MP3";
	// 			button.classList.remove("stuck");
	// 			new Notification({"id": "mp3", "title": "MP3 recording finished", "html": "<a href=\""+url+"\" target=\"blank\">And here it is!</a> (open or save as)<br><br>This feature is experimental.<br>Send complaints to <a href=\"mailto:multiplayerpiano.com@gmail.com\">multiplayerpiano.com@gmail.com</a>.", "duration": 0});
	// 		}
	// 	});
	// 	function onAudioProcess(evt) {
	// 		var inputL = evt.inputBuffer.getChannelData(0);
	// 		var inputR = evt.inputBuffer.getChannelData(1);
	// 		var mp3buf = encoder.encodeBuffer(convert16(inputL), convert16(inputR));
	// 		mp3_buffer.push(mp3buf);
	// 	}
	// 	function convert16(samples) {
	// 		var len = samples.length;
	// 		var result = new Int16Array(len);
	// 		for(var i = 0; i < len; i++) {
	// 			result[i] = 0x8000 * samples[i];
	// 		}
	// 		return(result);
	// 	}
	// })();







	// synth
	var enableSynth = false;
	var audio = gPiano.audio;
	var context = gPiano.audio.context;
	// var synth_gain = context.createGain();
	// synth_gain.gain.value = 0.05;
	// synth_gain.connect(audio.synthGain);

	var osc_types = ["sine", "square", "sawtooth", "triangle"];
	var osc_type_index = 1;

	var osc1_type = "square";
	var osc1_attack = 0;
	var osc1_decay = 0.2;
	var osc1_sustain = 0.5;
	var osc1_release = 2.0;

	function synthVoice(note_name, time) {
		var note_number = MIDI_KEY_NAMES.indexOf(note_name);
		note_number = note_number + 9 - MIDI_TRANSPOSE;
		var freq = Math.pow(2, (note_number - 69) / 12) * 440.0;
		this.osc = context.createOscillator();
		this.osc.type = osc1_type;
		this.osc.frequency.value = freq;
		this.gain = context.createGain();
		this.gain.gain.value = 0;
		this.osc.connect(this.gain);
		this.gain.connect(synth_gain);
		this.osc.start(time);
		this.gain.gain.setValueAtTime(0, time);
		this.gain.gain.linearRampToValueAtTime(1, time + osc1_attack);
		this.gain.gain.linearRampToValueAtTime(osc1_sustain, time + osc1_attack + osc1_decay);
	}

	synthVoice.prototype.stop = function(time) {
		//this.gain.gain.setValueAtTime(osc1_sustain, time);
		this.gain.gain.linearRampToValueAtTime(0, time + osc1_release);
		this.osc.stop(time + osc1_release);
	};

	// (function() {
	// 	var button = document.getElementById("synth-btn");
	// 	var notification;

	// 	button.addEventListener("click", function() {
	// 		if(notification) {
	// 			notification.close();
	// 		} else {
	// 			showSynth();
	// 		}
	// 	});

	// 	function showSynth() {

	// 		var html = document.createElement("div");

	// 		// on/off button
	// 		(function() {
	// 			var button = document.createElement("input");
	// 			mixin(button, {type: "button", value: "ON/OFF", className: enableSynth ? "switched-on" : "switched-off"});
	// 			button.addEventListener("click", function(evt) {
	// 				enableSynth = !enableSynth;
	// 				button.className = enableSynth ? "switched-on" : "switched-off";
	// 				if(!enableSynth) {
	// 					// stop all
	// 					for(var i in audio.playings) {
	// 						if(!audio.playings.hasOwnProperty(i)) continue;
	// 						var playing = audio.playings[i];
	// 						if(playing && playing.voice) {
	// 							playing.voice.osc.stop();
	// 							playing.voice = undefined;
	// 						}
	// 					}
	// 				}
	// 			});
	// 			html.appendChild(button);
	// 		})();

	// 		// mix
	// 		var knob = document.createElement("canvas");
	// 		mixin(knob, {width: 32 * devicePixelRatio, height: 32 * devicePixelRatio, className: "knob"});
	// 		html.appendChild(knob);
	// 		knob = new Knob(knob, 0, 100, 0.1, 50, "mix", "%");
	// 		knob.canvas.style.width = "32px";
	// 		knob.canvas.style.height = "32px";
	// 		knob.on("change", function(k) {
	// 			var mix = k.value / 100;
	// 			audio.pianoGain.gain.value = 1 - mix;
	// 			audio.synthGain.gain.value = mix;
	// 		});
	// 		knob.emit("change", knob);

	// 		// osc1 type
	// 		(function() {
	// 			osc1_type = osc_types[osc_type_index];
	// 			var button = document.createElement("input");
	// 			mixin(button, {type: "button", value: osc_types[osc_type_index]});
	// 			button.addEventListener("click", function(evt) {
	// 				if(++osc_type_index >= osc_types.length) osc_type_index = 0;
	// 				osc1_type = osc_types[osc_type_index];
	// 				button.value = osc1_type;
	// 			});
	// 			html.appendChild(button);
	// 		})();

	// 		// osc1 attack
	// 		var knob = document.createElement("canvas");
	// 		mixin(knob, {width: 32 * devicePixelRatio, height: 32 * devicePixelRatio, className: "knob"});
	// 		html.appendChild(knob);
	// 		knob = new Knob(knob, 0, 1, 0.001, osc1_attack, "osc1 attack", "s");
	// 		knob.canvas.style.width = "32px";
	// 		knob.canvas.style.height = "32px";
	// 		knob.on("change", function(k) {
	// 			osc1_attack = k.value;
	// 		});
	// 		knob.emit("change", knob);

	// 		// osc1 decay
	// 		var knob = document.createElement("canvas");
	// 		mixin(knob, {width: 32 * devicePixelRatio, height: 32 * devicePixelRatio, className: "knob"});
	// 		html.appendChild(knob);
	// 		knob = new Knob(knob, 0, 2, 0.001, osc1_decay, "osc1 decay", "s");
	// 		knob.canvas.style.width = "32px";
	// 		knob.canvas.style.height = "32px";
	// 		knob.on("change", function(k) {
	// 			osc1_decay = k.value;
	// 		});
	// 		knob.emit("change", knob);

	// 		var knob = document.createElement("canvas");
	// 		mixin(knob, {width: 32 * devicePixelRatio, height: 32 * devicePixelRatio, className: "knob"});
	// 		html.appendChild(knob);
	// 		knob = new Knob(knob, 0, 1, 0.001, osc1_sustain, "osc1 sustain", "x");
	// 		knob.canvas.style.width = "32px";
	// 		knob.canvas.style.height = "32px";
	// 		knob.on("change", function(k) {
	// 			osc1_sustain = k.value;
	// 		});
	// 		knob.emit("change", knob);

	// 		// osc1 release
	// 		var knob = document.createElement("canvas");
	// 		mixin(knob, {width: 32 * devicePixelRatio, height: 32 * devicePixelRatio, className: "knob"});
	// 		html.appendChild(knob);
	// 		knob = new Knob(knob, 0, 2, 0.001, osc1_release, "osc1 release", "s");
	// 		knob.canvas.style.width = "32px";
	// 		knob.canvas.style.height = "32px";
	// 		knob.on("change", function(k) {
	// 			osc1_release = k.value;
	// 		});
	// 		knob.emit("change", knob);



	// 		var div = document.createElement("div");
	// 		div.innerHTML = "<br><br><br><br><center>this space intentionally left blank</center><br><br><br><br>";
	// 		html.appendChild(div);

			

	// 		// notification
	// 		notification = new Notification({title: "Synthesize", html: html, duration: -1, target: "#synth-btn"});
	// 		notification.on("close", function() {
	// 			var tip = document.getElementById("tooltip");
	// 			if(tip) tip.parentNode.removeChild(tip);
	// 			notification = null;
	// 		});
	// 	}
	// })();
	
	// var onClick = function(evt) {
	// 	document.removeEventListener("click", onClick);
	// 	MPP.piano.audio.audio.resume();
	// }
	// document.addEventListener("click", onClick);

	openModal("#sound-warning");
	var user_interact = function(evt) {
        if ((evt.path || (evt.composedPath && evt.composedPath())).includes(document.getElementById('sound-warning')) || evt.target === document.getElementById('sound-warning')) {
            closeModal();
        }
        document.removeEventListener("click", user_interact);
        gPiano.audio.resume();
    }
	document.addEventListener("click", user_interact)

	gClient.on('hi', msg => {
		$('.motd').text(msg.motd);
	});

	$("#unban-btn").on('click', () => {
		openModal('#unban');
	});

	$('#unban .submit').on('click', () => {
		let _id = $('#unban input[name=_id]').val();
		if (_id !== '') {
			MPP.client.sendArray([{ m: 'unban', _id }])
		}
		$('#unban input[name=_id]').val('');
		closeModal();
	});
});

// $("#bottom .relative").append(`<div id="hmpp-button" class="ugly-button translate">HMPP</div>`)
// $("#hmpp-button").css("position", "absolute").css("left", "780px").css("top", "32px").on("click", () => {MPP.client.stop(); MPP.client.uri = "wss://mpp.hri7566.info:8443"; MPP.client.start()})

// $("#bottom .relative").append(`<div id="mpp-button" class="ugly-button translate">MPP</div>`)
// $("#mpp-button").css("position", "absolute").css("left", "900px").css("top", "32px").on("click", () => {MPP.client.stop(); MPP.client.uri = "wss://app_legacy.multiplayerpiano.com:443"; MPP.client.start()})
