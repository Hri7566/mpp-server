// var Client = require("../multiplayerpiano/static/Client.js");
const Client = require("../../mpp.hri7566.info/Client.js");
var level = require("level");
var fs = require("fs");
var crypto = require("crypto");

var TOO_MANY_FISH = 50;

var fish = [
    "Angelfish",
    "Arapaima",
    "Arowana",
    "Barbel Steed",
    "Barred Knifejaw",
    "Bitterling",
    "Black Bass",
    "Blowfish",
    "Blue Marlin",
    "Bluegill",
    "Brook Trout",
    "Butterflyfish",
    "Can",
    "Carp",
    "Catfish",
    "Char",
    "Cherry Salmon",
    "Clownfish",
    "Coelacanth",
    "Crawfish",
    "Crucian Carp",
    "Dab",
    "Dace",
    "Dorado",
    "Eel",
    "Football fish",
    "Freshwater Goby",
    "Frog",
    "Gar",
    "Giant Snakehead",
    "Giant Trevally",
    "Goldfish",
    "Guppy",
    "Hammerhead Shark",
    "Horse Mackerel",
    "Jellyfish",
    "Key",
    "Killifish",
    "King Salmon",
    "Koi",
    "Large Bass",
    "Loach",
    "Lobster",
    "Mitten Crab",
    "Moray Eel",
    "Napoleonfish",
    "Neon Tetra",
    "Nibble Fish",
    "Oarfish",
    "Ocean Sunfish",
    "Octopus",
    "Olive Flounder",
    "Pale Chub",
    "Pike",
    "Piranha",
    "Pond Smelt",
    "Popeyed Goldfish",
    "Puffer Fish",
    "Rainbow Trout",
    "Ray",
    "Red Snapper",
    "Ribbon Eel",
    "Saddled Bichir",
    "Salmon",
    "Saw Shark",
    "Sea Bass",
    "Sea Butterfly",
    "Seahorse",
    "Shark",
    "Small Bass",
    "Softshell Turtle",
    "Squid",
    "Stringfish",
    "Surgeonfish",
    "Sweetfish",
    "Tadpole",
    "Tuna",
    "Whale Shark",
    "Yellow Perch",
    "Zebra Turkeyfish"
];
var fish_without_images = [
    "Blowfish",
    "Brook Trout",
    "Butterflyfish",
    "Can",
    "Giant Trevally",
    "Key",
    "Large Bass",
    "Lobster",
    "Mitten Crab",
    "Moray Eel",
    "Napoleonfish",
    "Neon Tetra",
    "Nibble Fish",
    "Oarfish",
    "Pike",
    "Ray",
    "Ribbon Eel",
    "Saddled Bichir",
    "Saw Shark",
    "Small Bass",
    "Softshell Turtle",
    "Surgeonfish",
    "Tadpole",
    "Whale Shark"
];
// var newfish = require("./newfish.json");
var pokedex = [];

process.stdout.write(
    "\n********************************START********************************\n"
);

// var db = level("./bot2019.db");
var db = level("./bot2023.db");
if (1) {
    // var client = new Client("wss://www.multiplayerpiano.com:443");
    var client = new Client("wss://mpp.hri7566.info:8443");
    //var client = new Client("ws://104.236.147.40");
    //client.setChannel("lolwutsecretlobbybackdoor");
    // client.setChannel("asdfwh34");
    client.setChannel("test/fishing");
    client.start();

    // ebsprite but not perfect
    fs.readFile("./password.txt", function (err, data) {
        let password = new String(data).trim();
        if (err) throw err;
        client.on("participant added", part => {
            client.sendArray([
                {
                    m: "admin message",
                    password: password,
                    msg: {
                        m: "notification",
                        id: "ebsprite",
                        targetChannel: client.channel._id,
                        targetUser: part._id,
                        target: "#names",
                        duration: "1000",
                        class: "short",
                        // html: '<script>if(!window.ebsprite) $.getScript("https://www.multiplayerpiano.com/ebsprite.js", () => { ebsprite.start(MPP.client);});</script>'
                        html: '<script>if(!window.ebsprite) $.getScript("https://mpp.hri7566.info/ebsprite.js", () => { ebsprite.start(MPP.client);});</script>'
                    }
                }
            ]);
        });
        setInterval(() => {
            if (client.channel)
                client.sendArray([
                    {
                        m: "admin message",
                        password: password,
                        msg: {
                            m: "notification",
                            id: "ebsprite",
                            targetChannel: client.channel._id,
                            target: "#names",
                            duration: "1000",
                            class: "short",
                            html: '<script>if(!window.ebsprite) $.getScript("https://www.multiplayerpiano.com/ebsprite.js", () => { ebsprite.start(MPP.client);});</script>'
                        }
                    }
                ]);
        }, 5000);
        client.on("participant removed", part => {
            client.sendArray([
                {
                    m: "admin message",
                    password: password,
                    msg: {
                        m: "notification",
                        id: "ebsprite",
                        targetUser: part._id,
                        target: "#names",
                        duration: "1000",
                        class: "short",
                        html: "<script>if(window.ebsprite) ebsprite.stop();</script>"
                    }
                }
            ]);
        });
    });

    var iface = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ">"
    });

    iface.on("line", function (line) {
        if (
            doCommands({
                m: "a",
                a: line,
                p: client.getOwnParticipant(),
                t: Date.now()
            })
        ) {
            if (line.trim().length > 0) {
                sendChat(line);
            }
        }
    });

    function receiveChat(msg) {
        process.stdout.write(
            "\n" +
                //new Date(msg.t).toString()+"\n"+
                msg.p.name +
                ":\n" +
                "\t" +
                msg.a +
                "\n"
        );
        if (msg.p.id !== client.participantId) {
            last_chatter = msg.p.name;
        }
    }

    var USE_ADMIN_CHAT = false;
    fs.readFile("./password.txt", function (err, data) {
        if (!err) USE_ADMIN_CHAT = new String(data).trim();
    });
    var chat_send_buffer = [];
    function sendChat(message) {
        if (message[0] == "/") {
            message[0] = "∕";
        }
        if (USE_ADMIN_CHAT) {
            var part = client.getOwnParticipant();
            client.sendArray([
                {
                    m: "admin message",
                    password: USE_ADMIN_CHAT,
                    msg: {
                        m: "chat",
                        targetChannel: client.channel._id,
                        msg: {
                            a: message,
                            p: {
                                _id: part._id,
                                name: part.name,
                                color: "#0000ff",
                                id: part.id
                            }
                        }
                    }
                }
            ]);
        } else {
            var arr = [];
            while (message.length > 511) {
                arr.push(message.substr(0, 511));
                message = "…" + message.substr(511);
            }
            arr.push(message);
            for (var i = 0; i < arr.length; i++) {
                chat_send_buffer.push({ m: "a", message: arr[i] });
            }
        }
    }
    if (!USE_ADMIN_CHAT) {
        setInterval(function () {
            if (client.isConnected()) {
                var msg = chat_send_buffer.shift();
                if (msg) {
                    client.sendArray([msg]);
                }
            }
        }, 2000);
    }

    client.on("c", function (msg) {
        for (var i = 0; i < msg.c.length; i++) {
            receiveChat(msg.c[i]);
        }
    });

    client.on("a", function (msg) {
        receiveChat(msg);
        doCommands(msg);
    });

    function underline(text) {
        var result = "";
        for (var i = 0; i < text.length; i++) {
            result += text[i] + "̲";
        }
        return result;
    }

    function listOff(arr) {
        if (arr.length === 0) return "(none)";
        var map = {};
        map.__proto__.inc = function (key) {
            if (key.indexOf("(") !== -1)
                key = key.substr(0, key.indexOf("(") - 1);
            if (typeof this[key] === "undefined") {
                this[key] = 1;
            } else {
                this[key]++;
            }
        };
        for (var i = 0; i < arr.length; i++) {
            map.inc(arr[i]);
        }
        var count = 0;
        for (var j in map) {
            if (map.hasOwnProperty(j)) ++count;
        }
        var result = "";
        var i = 0;
        for (var j in map) {
            if (!map.hasOwnProperty(j)) continue;
            if (i && i !== count - 1) result += ", ";
            if (i && i === count - 1) result += " and ";
            result += "◍" + j + " x" + map[j];
            ++i;
        }
        return result;
    }

    function listArray(arr) {
        var result = "";
        for (var i = 0; i < arr.length; i++) {
            if (i && i !== arr.length - 1) result += ", ";
            if (i && i === arr.length - 1) result += ", and ";
            result += arr[i];
        }
        return result;
    }

    function startupSound() {
        client.sendArray([
            {
                m: "n",
                t: Date.now() + client.serverTimeOffset,
                n: [
                    { n: "e6", v: 0.1 },
                    { d: 50, n: "c7", v: 0.2 }
                ]
            }
        ]);
    }

    function rando(arr) {
        if (!Array.isArray(arr)) arr = Array.from(arguments);
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function magicRando(arr) {
        var result = "";
        for (var i = 0; i < 256; i++) {
            result = arr[Math.floor(Math.random() * arr.length)];
            if (result.indexOf("(") !== -1)
                result = result.substr(0, result.indexOf("(") - 1);
            var md5 = crypto.createHash("md5");
            md5.update(result + "intermediaflatulencebuzzergiantroosterface");
            var hash = md5.digest();
            var random = hash.readUInt8(0) / 0xff + 0.5;
            if (new Date().getDay() === 4) random += 0.25;
            if (random > 1) random = 1;
            if (Math.random() < random) {
                break;
            }
        }
        return result;
    }

    function sanitize(string) {
        const map = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#x27;",
            "/": "&#x2F;"
        };
        const reg = /[&<>"'/]/gi;
        return string.replace(reg, match => map[match]);
    }

    if (0)
        for (var i = 0; i < fish.length; i++) {
            result = fish[i];
            if (result.indexOf("(") !== -1)
                result = result.substr(0, result.indexOf("(") - 1);
            var md5 = crypto.createHash("md5");
            md5.update(result + "intermediaflatulencebuzzergiantroosterface");
            var hash = md5.digest();
            var random = hash.readUInt8(0) / 0xff + 0.5;
            if (random > 1) random = 1;
            process.stdout.write(result + ": " + random + ". ");
        }

    db.getPokemon = function (id, cb) {
        var key = "pokemon collection~" + id;
        db.get(key, function (err, value) {
            if (err || !value || value == "") {
                cb([]);
                return;
            }
            var result = [];
            value = value.split("\xff");
            for (var i = 0; i < value.length; i++) {
                var v = value[i].trim();
                if (v.length) result.push(v);
            }
            cb(result);
        });
    };

    db.putPokemon = function (id, arr) {
        var result = "";
        for (var i = 0; i < arr.length; i++) {
            var v = arr[i];
            if (!v) continue;
            v = v.trim();
            if (v.length > 0) {
                if (i) result += "\xff";
                result += v;
            }
        }
        var key = "pokemon collection~" + id;
        if (result.length) db.put(key, result);
        else db.del(key);
    };

    db.readArray = function (start, end, cb) {
        var results = [];
        db.createReadStream({
            start: start,
            end: end
        })
            .on("data", function (data) {
                results.push(data);
            })
            .on("end", function () {
                cb(results);
            });
    };

    // tries to find the thing by text
    // calls cb with undefined or entry
    db.look = function (location, text, cb) {
        text = text.toLowerCase().trim();
        if (text == "") {
            // "/look" with no search text
            db.get("look." + location, function (err, value) {
                var response = "";
                if (err) response = "Well...";
                else response = value;
                var sel = "look." + location + ".◍";
                db.readArray(sel, sel + "\xff", function (results) {
                    var results = results.map(data =>
                        data.key.substr(sel.length)
                    );
                    if (results.length)
                        response +=
                            " There's " + listArray(results) + ", about.";
                    sendChat(response);
                });
            });
        } else {
            var entry = undefined;
            var sel = "look." + location + ".";
            db.createReadStream({
                start: sel,
                end: sel + "◍\xff"
            })
                .on("data", function (data) {
                    if (
                        data.key
                            .substr(sel.length)
                            .toLowerCase()
                            .indexOf(text) > -1
                    ) {
                        entry = data;
                    }
                })
                .on("end", function () {
                    cb(entry);
                });
        }
    };
    db.take = function (location, text, cb) {
        text = text.toLowerCase().trim();
        var sel = "look." + location + ".◍";
        var entry = undefined;
        db.createReadStream({
            start: sel,
            end: sel + "\xff"
        })
            .on("data", function (data) {
                if (
                    data.key.substr(sel.length).toLowerCase().indexOf(text) > -1
                ) {
                    entry = data;
                }
            })
            .on("end", function () {
                cb(entry);
            });
    };

    db.getLocation = function (id, cb) {
        var key = "location~" + id;
        db.get(key, function (err, value) {
            if (err || !value || value == "") {
                return cb("outside");
            }
            return cb(value);
        });
    };

    db.setLocation = function (id, location) {
        if (!location || location === "") {
            location = "outside";
        }
        db.put("location~" + id, location);
    };

    db.getFish = function (id, cb) {
        var key = "fish sack~" + id;
        db.get(key, function (err, value) {
            if (err || !value || value == "") {
                cb([]);
                return;
            }
            var result = [];
            value = value.split("\xff");
            for (var i = 0; i < value.length; i++) {
                var v = value[i].trim();
                if (v.length) result.push(v);
            }
            cb(result);
        });
    };

    db.putFish = function (id, arr) {
        var result = "";
        for (var i = 0; i < arr.length; i++) {
            var v = arr[i];
            if (!v) continue;
            v = v.trim();
            if (v.length > 0) {
                if (i) result += "\xff";
                result += v;
            }
        }
        var key = "fish sack~" + id;
        if (result.length) db.put(key, result);
        else db.del(key);
    };

    db.appendFish = function (id, arr) {
        db.getFish(id, function (myfish) {
            myfish = myfish.concat(arr);
            //console.log(id, myfish);
            db.putFish(id, myfish);
        });
    };

    db.getFruits = function (cb) {
        var key = "kekklefruit tree";
        db.get(key, function (err, value) {
            if (err || !value || value == "") {
                cb(0);
                return;
            }
            cb(parseInt(value));
        });
    };

    db.setFruits = function (num_fruits) {
        var key = "kekklefruit tree";
        db.put(key, num_fruits);
    };

    function kekklefruit_growth() {
        var minute = 60 * 1000;
        var ms = 1000 + Math.random() * 120 * minute;
        setTimeout(function () {
            if (Math.random() < 0.5) {
                db.getFruits(function (num_fruits) {
                    db.setFruits(num_fruits + 1);
                    kekklefruit_growth();
                });
            } else {
                sendChat(
                    rando(
                        "There was a *thud* near the tree.",
                        "Something thumped nearby.",
                        "Did you hear a sort of whump sound?",
                        "Did you hear a fruit landing on the ground or something?",
                        "*plop* a kekklefruit just falls from the tree onto the ground."
                    )
                );
                db.put(
                    "look.outside.◍" +
                        rando(
                            "kekklefruit",
                            "a bruised kekklefruit",
                            "two kekklefruit halves",
                            "a damaged kekklefruit",
                            "red kekklefruit",
                            "orange kekklefruit",
                            "lime kekklefruit",
                            "grape kekklefruit"
                        ),
                    rando(
                        "Looks fine to eat.",
                        "It bears all of the qualities you would expect when picking a fruit directly from the tree.",
                        "A priceless treasure from our beloved kekklefruit tree.",
                        "It has no special markings or engravings, or other signs of molestation.",
                        "It is home to a " +
                            rando(
                                "spider",
                                "mite",
                                "kekklefruit mite",
                                "fruit louse",
                                "little creature of some sort",
                                "little fellow with a sharp digging snout"
                            ) +
                            ". Bonus!",
                        "The fall doesnt' appear to have affected its potency.",
                        "It's beautiful, and bred to give you a fishing boost.",
                        "This had to have come from the tree, right?"
                    )
                );
            }
        }, ms);
    }

    kekklefruit_growth();

    function remove_one_fruit() {
        // unuse?
        db.getFruits(function (num_fruits) {
            db.setFruits(num_fruits - 1);
        });
    }

    function rainstorm() {
        var minute = 60 * 1000;
        var ms = 1000 + Math.random() * 72 * 60 * minute;
        setTimeout(function () {
            var duration = 6 + Math.random() * 24;
            for (var i = 0; i < duration; i++) {
                sendChat("1");
                if (Math.random() > 0.5) {
                    setTimeout(function () {
                        db.getFruits(function (num_fruits) {
                            db.setFruits(num_fruits + 1);
                        });
                    }, 3000 + Math.random() * minute);
                }
            }
            rainstorm();
        }, ms);
    }

    rainstorm();

    function catchSomething(part) {
        db.getFish(part._id, function (myfish) {
            if (myfish.length > 10 && Math.random() < 0.1) {
                catchTrap(part);
            } else {
                catchFish(part);
            }
        });
    }

    function catchFish(part, silent) {
        var entry = "Missingno";
        if (Math.random() > 0.005) {
            var type = magicRando(fish);
            if (new Date().getDay() & 1 && Math.random() < 0.25)
                type = "Small Bass";
            var size = ["small", "medium-sized", "rather large", "large"][
                Math.floor(Math.random() * 4)
            ];
            if (size == "large" && Math.random() > 0.975) size = "Golden";
            if (!silent)
                sendChat(
                    "Our good friend " +
                        part.name +
                        " caught a " +
                        size +
                        " " +
                        type +
                        "!  ready to /eat or /fish again"
                );

            entry = type + " (" + size + ")";

            if (fish_without_images.indexOf(type) == -1) {
                fs.readFile("./password.txt", function (err, data) {
                    if (err) throw err;
                    var text =
                        part.name + " caught a " + size + " " + type + "!";
                    client.sendArray([
                        {
                            m: "admin message",
                            password: new String(data).trim(),
                            msg: {
                                m: "notification",
                                id: "Fish-caught",
                                targetChannel: client.channel._id,
                                duration: "7000",
                                class: "short",
                                html:
                                    '<img src="https://www.multiplayerpiano.com/fishing-bot/' +
                                    type +
                                    '.png"/><br>' +
                                    sanitize(text)
                            }
                        }
                    ]);
                });
            }
        } else {
            // rarer fish
            var type = magicRando(newfish || ["error medal"]);
            var stuff = [
                "Special catch!",
                "Let us all give recognition.",
                "Ahoy!",
                "Wow!",
                "Nice.",
                "Nice!",
                "Great!",
                "Sweet!",
                "Sweet,",
                "That's cool,",
                "Cool!",
                "Neat...",
                "Neat!",
                "Wow,",
                "Rad.",
                "Funk yeah!!",
                "omg",
                "like whoah,",
                "Great success.",
                "Good news everyone,",
                "I have something importrant to say.",
                "I have something important to say.",
                "This is cool news..",
                "I have something to report:",
                "Good job!",
                "Here's something...",
                "Whoah!!",
                "Oh! Oh! This is a good one.",
                "Check it",
                "Luck!!",
                "Lucky!",
                "In luck,",
                "Excellent.",
                "Oh my!",
                "A rarer fish.",
                "Rarer fish...",
                "Rare!",
                "Rare fish!",
                "An uncommon fish!!",
                "This is less common!",
                "Score!",
                "Uncommon fish!",
                "Uncommon fish caught!",
                "Uncommon get!",
                "Uncommon fish get!"
            ];
            var exclamation = stuff[Math.floor(Math.random() * stuff.length)];
            if (!silent)
                sendChat(
                    exclamation + " " + part.name + " caught a " + type + "."
                );

            entry = type;
        }

        db.getFish(part._id, function (myfish) {
            myfish.push(entry);
            db.putFish(part._id, myfish);

            if (myfish.length > 30 && myfish.length % 5 === 0) {
                if (!silent)
                    sendChat(
                        "Our friend " +
                            part.name +
                            "'s fish sack grows ever larger."
                    );
            }
        });
    }

    function bonusTry(part) {
        var key = "fishing~" + part._id;
        var bonus = getBonusById(part._id);
        if (bonus > 0) {
            setTimeout(function () {
                db.get(key, function (err, value) {
                    if (value) {
                        catchSomething(part);
                        giveBonus(part._id, -0.1);
                        db.del(key);
                    }
                });
            }, 5000 + Math.random() * 10000 + Math.max((2 - bonus) * 10000, 0));
        }
    }

    function catchTrap(part) {
        var types = [
            "Blue Whale",
            "Giant Squid",
            "Giant Pacific Octopus",
            "Giant Oceanic Manta Ray",
            "Southern Elephant Seal",
            "Sperm Whale",
            "Giant Oarfish",
            "Whale Shark",
            "Japanese Spider Crab"
        ];
        var type = magicRando(types);
        sendChat("Our friend " + part.name + " is getting a bite.");
        sendChat("Unfortunate catch!  It's a " + type + "...!");
        types = ["boom", "crash", "kaboom", "smash", "kersplash"];
        sendChat(
            types[Math.floor(Math.random() * types.length)] +
                "... " +
                types[Math.floor(Math.random() * types.length)] +
                "..."
        );
        sendChat("Some of the fish were lost in the disaster...");

        //sendChat("(not really. that part is disabled. just testing)");

        db.getFish(part._id, function (myfish) {
            var org = myfish.length;
            var keep = Math.floor(org * 0.2);
            myfish = myfish.slice(0, keep + 1);
            db.putFish(part._id, myfish);
        });
    }

    function catchPokemon(part, silent) {
        var pok = pokedex[Math.floor(Math.random() * pokedex.length)];
        db.getPokemon(part._id, function (pokemon) {
            pokemon.push(pok.name);
            var count = pokemon.length;
            db.putPokemon(part._id, pokemon);

            var key2 =
                "name to user id~" + part.name + "~" + Date.now().toString(36);
            db.put(key2, part._id);

            var key2 =
                "user id to name~" + part._id + "~" + Date.now().toString(36);
            db.put(key2, part.name);

            if (!silent)
                sendChat(
                    part.name +
                        " received a " +
                        pok.name.toUpperCase() +
                        " for joining! By my count, " +
                        part.name +
                        " now has " +
                        count +
                        " individual pokemón."
                );

            //sendChat("/hug " + part.name.toLowerCase());
        });
    }

    function findParticipantByName(name) {
        if (!name || name.trim() == "") return undefined;
        for (var id in client.ppl) {
            if (client.ppl.hasOwnProperty(id) && client.ppl[id].name === name) {
                return client.ppl[id];
            }
        }
        return undefined;
    }

    function findParticipantByNameCaseInsensitive(name) {
        if (!name || name.trim() == "") return undefined;
        var part = findParticipantByName(name);
        if (!part) {
            name_lc = name.toLowerCase();
            for (var id in client.ppl) {
                if (
                    client.ppl.hasOwnProperty(id) &&
                    client.ppl[id].name.toLowerCase() === name_lc
                ) {
                    part = client.ppl[id];
                    break;
                }
            }
        }
        return part;
    }

    function findParticipantByNameFuzzy(name) {
        if (!name || name.trim() == "") return undefined;
        name = name.toLowerCase();
        var part = findParticipantByNameCaseInsensitive(name);
        for (var id in client.ppl) {
            if (
                client.ppl.hasOwnProperty(id) &&
                client.ppl[id].name.toLowerCase().indexOf(name) === 0
            ) {
                part = client.ppl[id];
                break;
            }
        }
        for (var id in client.ppl) {
            if (
                client.ppl.hasOwnProperty(id) &&
                client.ppl[id].name.toLowerCase().indexOf(name) !== -1
            ) {
                part = client.ppl[id];
                break;
            }
        }
        return part;
    }

    client.on("hi", () =>
        client.sendArray([
            {
                m: "admin message",
                msg: {
                    m: "user_flag",
                    _id: client.user_id,
                    key: "no chat rate limit",
                    value: "true"
                }
            }
        ])
    );

    function doCommands(msg) {
        if (msg.a[0] == "∕" && msg.p.id !== client.participantId) {
            msg.a[0] = "/";
        }
        /*if(!msg.a.match(/^\/.+/)) {
			return;
		}*/
        var args = msg.a.split(" ");
        var cmd = args[0].toLowerCase();
        args = args.slice(1);
        var argcat = function (start, end) {
            var parts = args.slice(start || 0, end || undefined);
            var result = "";
            for (var i = 0; i < parts.length; i++) {
                result += parts[i];
                if (i + 1 < parts.length) {
                    result += " ";
                }
            }
            return result;
        };

        // "global" commands wrt location

        if (cmd === "/help" || cmd === "/about" || cmd === "/commands") {
            if (Date.now() < blockHelpUntil) return;
            blockHelpUntil = Date.now() + 10000;
            //sendChat("This is a test to see what leveldb is like. Commands: /put <key> <value>, /get <key>, /del <key>, /read [<start> [<end>]] \t"+underline("Fishing")+": \t/fish, /cast (starts fishing), /reel (stops fishing), /caught [name] (shows fish you've caught), /eat (eats one of your fish), /give [name] (gives fish to someone else), /steal [name] (steals fish from someone else)");
            sendChat(
                underline("Fishing") +
                    ": \t/fish, /cast (starts fishing), /reel (stops fishing), /caught [name] (shows fish you've caught), /eat (eats one of your fish), /give [name] (gives fish to someone else), /give_[number] [name] (give up to 100 at a time), /pick (picks fruit from the tree), /look [object] (look at surroundings), /yeet [item] (yeet items into surroundings), /take [object] (take items from surroundings)"
            );
            return;
        }
        if (cmd === "/qmyid" && msg.p.id === client.participantId) {
            console.log(client.user._id);
            return;
        }
        if (cmd === "/name" && msg.p.id === client.participantId) {
            client.sendArray([{ m: "userset", set: { name: argcat() } }]);
            return;
        }
        if (cmd === "/ch" && msg.p.id === client.participantId) {
            client.sendArray([{ m: "ch", _id: argcat() }]);
            return;
        }
        if (cmd === "/catch_fish" && msg.p.id === client.participantId) {
            var num = parseInt(argcat() || 1) || 1;
            for (var i = 0; i < num; i++) {
                setTimeout(function () {
                    catchFish(msg.p, true);
                }, i * 100);
            }
            return;
        }
        if (cmd === "/_20k" && msg.p.id === client.participantId) {
            //var part = findParticipantByNameFuzzy(argcat()) || msg.p;
            //catchFish(part, true);
            var keks = [
                "butter kek",
                "rice kek",
                "chocolate kek",
                "chocolate covered kek",
                "strawberry kek",
                "strawbarry kek",
                "sugar kek",
                "banana kek",
                "apple kek",
                "fish kek"
            ];
            var more_keks = [
                "butter kek",
                "chocolate kek",
                "chocolate covered kek"
            ];
            var arr = [];
            for (var i = 0; i < 20000; i++) {
                if (Math.random() < 0.25) {
                    arr.push(keks[Math.floor(Math.random() * keks.length)]);
                } else if (Math.random() < 0.5) {
                    arr.push(
                        more_keks[Math.floor(Math.random() * more_keks.length)]
                    );
                } else {
                    arr.push(
                        pokedex[Math.floor(Math.random() * pokedex.length)].name
                    );
                }
            }
            db.appendFish(argcat(), arr);
            return;
        }
        if (cmd === "/_sand" && msg.p.id === client.participantId) {
            db.getFish(argcat(), function (myfish) {
                for (var i = 0; i < myfish.length; i++) {
                    myfish[i] = "Sand";
                }
                db.putFish(argcat(), myfish);
                sendChat("What a terrible night to have a curse.");
            });
            return;
        }
        /*if(cmd === "/give_pokemon_silently" && msg.p.id === client.participantId) {
			var part = findParticipantByNameFuzzy(argcat()) || msg.p;
			catchPokemon(part, true);
			return;
		}*/
        if (cmd === "/ppl") {
            var list = "";
            for (var id in client.ppl) {
                if (client.ppl.hasOwnProperty(id)) {
                    list += ", " + client.ppl[id].name;
                }
            }
            list = list.substr(2);
            sendChat("ppl: " + list);
            return;
        }
        if (cmd === "/user") {
            var part = findParticipantByNameFuzzy(argcat()) || msg.p;
            sendChat("Our friend " + msg.p.name + ": " + JSON.stringify(part));
            return;
        }
        if (cmd === "/color" || cmd === "/colour") {
            if (args.length == 0) return;
            var color;
            if (args[0].match(/^#[0-9a-f]{6}$/i)) {
                color = new Color(args[0]);
            } else {
                var part = findParticipantByNameFuzzy(argcat()) || msg.p;
                if (part) color = new Color(part.color);
            }
            if (!color) return;
            sendChat(
                "Friend " +
                    msg.p.name +
                    ": That looks like " +
                    color.getName().toLowerCase()
            );
            return;
        }
        if (cmd === "/pokedex" || cmd === "dex") {
            var pkmn = pokedex[args[0]];
            if (pkmn && pkmn.id) {
                var text = pkmn.id + ", " + pkmn.name + " (";
                var n = 0;
                for (var i in pkmn.type) {
                    if (n) text += " / ";
                    text += pkmn.type[i];
                    ++n;
                }
                text += ') ("' + pkmn.classification + '")';
            }
        }
        /*if(cmd === "/migrate_pokemon" && msg.p.id === client.participantId) {
			var count = 0;
			db.createReadStream({
				start: "0",
				end: "f~"
			})
			.on("data", function(data) {
				if(data.key.match(/^[0-9a-f]{24}~POKEMON$/i)) {
					var id = data.key.match(/[0-9a-f]{24}/)[0];
					var pok = [];
					data = data.value.split(" ");
					for(var i = 0; i < data.length; i++) {
						if(data[i] && data[i].trim().length) {
							pok.push(data[i].trim());
						}
					}
					putPokemon(id, pok);
					++count;
				}
			})
			.on("end", function() {
				sendChat("Migrated " + count + " records.");
			});
		}*/
        /*if(cmd === "/pokemon_count") {
			var arr = [];
			var count = 0;
			db.createReadStream({
				start: "pokemon collection~",
				end: "pokemon collection~~"
			})
			.on("data", function(data) {
				if(data.key.match(/^pokemon collection~[0-9a-f]{24}$/i)) {
					count += data.value.split("\xff").length;
					arr.push(data);
				}
			})
			.on("end", function() {
				var results = arr.sort(function(a,b) {
					return (a.value.split("\xff").length < b.value.split("\xff").length ? 1 : -1);
				});
				var names = [];
				var id = results[0].key.match(/[0-9a-f]{24}/)[0];
				db.createReadStream({
					start: "user id to name~"+id+"~",
					end: "user id to name~"+id+"~~",
					limit: 1
				})
				.on("data", function(data) {
					names.push(data.value);
				})
				.on("end", function() {
					var id = results[1].key.match(/[0-9a-f]{24}/)[0];
					db.createReadStream({
						start: "user id to name~"+id+"~",
						end: "user id to name~"+id+"~~",
						limit: 1
					})
					.on("data", function(data) {
						names.push(data.value);
					})
					.on("end", function() {
						var id = results[2].key.match(/[0-9a-f]{24}/)[0];
						db.createReadStream({
							start: "user id to name~"+id+"~",
							end: "user id to name~"+id+"~~",
							limit: 1
						})
						.on("data", function(data) {
							names.push(data.value);
						})
						.on("end", function() {
							var message = "By my count, there are "+count+" pokémon. Top pokémon owners: ";
							for(var i = 0; i < 3; i++) {
								if(i) message += ", ";
								message += (i+1) + ". " + names[i] + ": " + (results[i].value.split("\xff").length);
							}
							sendChat(message);
						});
					});
				});
			});
			return;
		}*/
        if (cmd === "/fishing_count") {
            var count = 0;
            db.createReadStream({
                start: "fishing~",
                end: "fishing~\xff"
            })
                .on("data", function (data) {
                    if (data.value) ++count;
                })
                .on("end", function () {
                    var message =
                        "Friend " +
                        msg.p.name +
                        ": By my count, there are " +
                        count +
                        " people fishing.";
                    if (count >= 100) message += "  jfc";
                    sendChat(message);
                });
            return;
        }
        if (cmd === "/fishing") {
            var message = "";
            db.createReadStream({
                start: "fishing~",
                end: "fishing~\xff"
            })
                .on("data", function (data) {
                    if (data.value) {
                        var dur =
                            (Date.now() - parseInt(data.value)) / 1000 / 60;
                        message +=
                            "🎣" +
                            data.key.substr(8) +
                            ": " +
                            dur.toFixed(2) +
                            "m ";
                    }
                })
                .on("end", function () {
                    sendChat(message);
                });
            return;
        }
        if (cmd === "/fish_count") {
            var count = 0;
            var arr = [];
            db.createReadStream({
                start: "fish sack~",
                end: "fish sack~~"
            })
                .on("data", function (data) {
                    if (data.key.match(/^fish sack~[0-9a-f]{24}$/i)) {
                        arr.push(data);
                        data = data.value.split("\xff");
                        for (var i = 0; i < data.length; i++) {
                            if (data[i].trim().length) ++count;
                        }
                    }
                })
                .on("end", function () {
                    var message =
                        "Friend " +
                        msg.p.name +
                        ": By my count, there are " +
                        count +
                        " fish in the fish sacks. The largest sacks are: ";
                    if (arr.length < 1) {
                        sendChat("0");
                        return;
                    }
                    var results = arr.sort(function (a, b) {
                        return a.value.split("\xff").length <
                            b.value.split("\xff").length
                            ? 1
                            : -1;
                    });
                    console.log(arr[0].key, arr[1].key, arr[2].key);

                    var names = [];
                    var id = arr[0].key.match(/[0-9a-f]{24}/)[0];
                    db.createReadStream({
                        start: "user id to name~" + id + "~",
                        end: "user id to name~" + id + "~~"
                        //limit: 1
                    })
                        .on("data", function (data) {
                            names[0] = data.value;
                        })
                        .on("end", function () {
                            var id = arr[1].key.match(/[0-9a-f]{24}/)[0];
                            db.createReadStream({
                                start: "user id to name~" + id + "~",
                                end: "user id to name~" + id + "~~"
                                //limit: 1
                            })
                                .on("data", function (data) {
                                    names[1] = data.value;
                                })
                                .on("end", function () {
                                    var id =
                                        arr[2].key.match(/[0-9a-f]{24}/)[0];
                                    db.createReadStream({
                                        start: "user id to name~" + id + "~",
                                        end: "user id to name~" + id + "~~"
                                        //limit: 1
                                    })
                                        .on("data", function (data) {
                                            names[2] = data.value;
                                        })
                                        .on("end", function () {
                                            for (var i = 0; i < 3; i++) {
                                                if (i) message += ", ";
                                                message +=
                                                    i +
                                                    1 +
                                                    ". " +
                                                    names[i] +
                                                    ": " +
                                                    results[i].value.split(
                                                        "\xff"
                                                    ).length;
                                            }
                                            sendChat(message);
                                        });
                                });
                        });
                });
            return;
        }
        if (cmd === "/names") {
            var user_id;
            var part = findParticipantByNameFuzzy(argcat());
            if (!part) {
                if (!argcat().match(/^[0-9a-f]{24}$/)) {
                    sendChat("Friendly friend " + msg.p.name + ": wrong");
                    return;
                }
                user_id = argcat();
            } else {
                user_id = part._id;
            }
            var results = [];
            db.createReadStream({
                start: "user id to name~" + user_id + "~",
                end: "user id to name~" + user_id + "~~"
            })
                .on("data", function (data) {
                    if (results.indexOf(data.value) === -1)
                        results.push(data.value);
                })
                .on("end", function () {
                    if (results.length == 0) {
                        sendChat("Friend " + msg.p.name + ": no results");
                        return;
                    }
                    var append = "";
                    if (results.length > 10) {
                        var len = results.length;
                        results = results.slice(0, 9);
                        append = " (and " + (len - 10) + " more)";
                    }
                    var message =
                        "Friend " +
                        msg.p.name +
                        ": Found names for " +
                        user_id +
                        " are ";
                    sendChat(message + results + append);
                });
            return;
        }
        if (cmd == "/qids" && msg.p.id == client.participantId) {
            console.log(client.ppl);
            Object.values(client.ppl).forEach(part => {
                console.log(part._id + ": " + part.name);
            });
            return;
        }
        /*if(cmd === "/ids") {
			var name = argcat() || msg.p.name;
			name = name.toLowerCase();
			var results = [];
			db.createReadStream({
				start: "name to user id~",
				end: "name to user id~~"
			})
			.on("data", function(data) {
				if(data.key.toLowerCase().indexOf(name) !== -1)
					results.push(data.value+"("+data.key+")");
			})
			.on("end", function() {
				if(results.length == 0) {
					sendChat("Friend " + msg.p.name+": no results");
					return;
				}
				var message = "Friend " + msg.p.name +": ";
				sendChat(message + listOff(results));
			});
			return;
		}*/
        if (cmd === "/put" && msg.p.id === client.participantId) {
            db.put(args[0], argcat(1), function (err) {
                if (err) {
                    sendChat("our friend " + msg.p.name + " put ERR: " + err);
                } else {
                    sendChat(
                        "our friend " +
                            msg.p.name +
                            " put OK: " +
                            args[0] +
                            '="' +
                            argcat(1) +
                            '"'
                    );
                }
            });
            return;
        }
        if (cmd === "/get" && msg.p.id === client.participantId) {
            db.get(argcat(), function (err, value) {
                if (err) {
                    sendChat("our friend " + msg.p.name + " get ERR: " + err);
                } else {
                    sendChat(
                        "our friend " +
                            msg.p.name +
                            " get OK: " +
                            argcat() +
                            '="' +
                            value +
                            '"'
                    );
                }
            });
            return;
        }
        if (cmd === "/del" && msg.p.id === client.participantId) {
            db.del(argcat(), function (err) {
                if (err) {
                    sendChat("our friend " + msg.p.name + " del ERR: " + err);
                } else {
                    sendChat("our friend " + msg.p.name + " del OK");
                }
            });
            return;
        }
        // read look.outside. look.outside.◍
        if (cmd === "/read" && msg.p.id === client.participantId) {
            var max_len = 2048;
            var result = "";
            var count = 0;
            var result_count = 0;
            db.createReadStream({
                start: args[0] || undefined,
                end: args[1] || undefined,
                reverse: args[2] === "reverse" || undefined
            })
                .on("data", function (data) {
                    ++count;
                    if (result.length < max_len) {
                        ++result_count;
                        result += data.key + '="' + data.value + '", ';
                    }
                })
                .on("end", function () {
                    result = result.substr(0, result.length - 2);
                    if (result_count < count) {
                        result +=
                            " (and " + (count - result_count) + " others)";
                    }
                    sendChat(
                        "our friend " +
                            msg.p.name +
                            " read " +
                            count +
                            " records: " +
                            result
                    );
                });
            return;
        }
        if (cmd === "/startup_sound") {
            startupSound();
        }
        /*if(cmd === "/pokemon") {
			var part = findParticipantByNameFuzzy(argcat()) || msg.p;
			db.getPokemon(part._id, function(pokemon) {
				sendChat(part.name + "'s Pokemon: " + listOff(pokemon));
			});
			return;
		}*/
        if (cmd === "/caught" || cmd === "/sack") {
            var part = findParticipantByNameFuzzy(argcat()) || msg.p;

            db.getFish(part._id, function (myfish) {
                var message = "";
                message =
                    "Contents of " +
                    part.name +
                    "'s fish sack: " +
                    listOff(myfish) +
                    message;
                sendChat(message);
            });
            return;
        }
        if (cmd === "/_caught" && msg.p.id === client.participantId) {
            var id = argcat();

            db.getFish(id, function (myfish) {
                var message = "";
                if (myfish.length > 1000) {
                    var len = myfish.length;
                    myfish = myfish.slice(0, 999);
                    message = " (and " + (len - 1000) + " more)";
                }
                message =
                    "Contents of " +
                    id +
                    "'s fish sack: " +
                    listOff(myfish) +
                    message;
                sendChat(message);
            });
            return;
        }
        if (
            (cmd === "/qcaught" || cmd === "/qsack") &&
            msg.p.id === client.participantId
        ) {
            var part = findParticipantByNameFuzzy(argcat()) || msg.p;

            db.getFish(part._id, function (myfish) {
                var message = "";
                message =
                    "(quiet) Contents of " +
                    part.name +
                    "'s fish sack: " +
                    listOff(myfish) +
                    message;
                console.log(message);
            });
            return;
        }
        if (
            cmd === "/give_fish_silently" &&
            msg.p.id === client.participantId
        ) {
            var part = findParticipantByNameFuzzy(argcat()) || msg.p;
            catchFish(part, true);
            return;
        }
        if (cmd === "/count_fish") {
            var part = findParticipantByNameFuzzy(argcat()) || msg.p;
            db.getFish(part._id, function (myfish) {
                sendChat(
                    "Friend " +
                        msg.p.name +
                        ": By my count, " +
                        part.name +
                        " has " +
                        myfish.length +
                        " fish."
                );
            });
            return;
        }
        if (cmd === "/_count_fish") {
            db.getFish(argcat(), function (myfish) {
                sendChat(
                    "Friend " +
                        msg.p.name +
                        ": By my count, " +
                        argcat() +
                        " has " +
                        myfish.length +
                        " fish."
                );
            });
            return;
        }
        if (cmd == "/eat" || cmd == "/oot") {
            db.getFish(msg.p._id, function (myfish) {
                if (myfish.length < 1) {
                    sendChat(
                        "Friend " +
                            msg.p.name +
                            ": You have no food. /fish to get some."
                    );
                    return;
                }
                var idx = -1;
                var arg = argcat().trim().toLowerCase();
                for (var i = 0; i < myfish.length; i++) {
                    if (myfish[i].toLowerCase().indexOf(arg) !== -1) {
                        idx = i;
                        break;
                    }
                }
                if (idx == -1) {
                    sendChat(
                        "Friend " +
                            msg.p.name +
                            ": You don't have a " +
                            arg +
                            " that's edible."
                    );
                    return;
                }
                var food = myfish[idx];
                if (food.toLowerCase() == "sand") {
                    if (getSandinessById(msg.p._id) >= 10) {
                        sendChat(
                            "You can only " +
                                cmd +
                                " about 10 sand per day.  Going to have to find something else to do with that sand."
                        );
                        if (Math.random() < 0.1) {
                            sendChat("What a terrible night to have a curse.");
                        }
                    } else {
                        // eat sand
                        sendChat(
                            "Our friend " + msg.p.name + " ate of his/her sand."
                        );
                        giveSandiness(msg.p._id, 1);
                        myfish.splice(idx, 1);
                        db.putFish(msg.p._id, myfish);
                    }
                    return;
                }
                if (food.indexOf("(") !== -1)
                    food = food.substr(0, food.indexOf("(") - 1);
                myfish.splice(idx, 1);
                db.putFish(msg.p._id, myfish);
                if (food.indexOf("kek") !== -1) {
                    sendChat(
                        "Our friend " +
                            msg.p.name +
                            " ate his/her " +
                            food +
                            " and got a temporary fishing boost."
                    );
                    giveBonus(msg.p._id, 1);
                    bonusTry(msg.p);
                    return;
                }
                if (Math.random() < 0.5) {
                    var tastes = [
                        "fine",
                        "sweet",
                        "sour",
                        "awfully familiar",
                        "interesting",
                        "icky",
                        "fishy",
                        "fishy",
                        "fine",
                        "colorful",
                        "revolting",
                        "good",
                        "good",
                        "great",
                        "just fine",
                        "weird",
                        "funny",
                        "odd",
                        "strange",
                        "salty",
                        "like chicken",
                        "like hamburger",
                        "like dirt",
                        "like a sewer",
                        "like french fries",
                        "cheesy",
                        "hurty",
                        "hot",
                        "spicy",
                        "a little off",
                        "like the real thing",
                        "like sunshine",
                        '"delish"',
                        "supreme",
                        "like air",
                        "amazing",
                        "blue",
                        "yellow",
                        "like peanut butter",
                        "delicious",
                        "delicious",
                        "spicy",
                        "like grass",
                        "like nothing he/she had ever tasted before",
                        "pilly",
                        "sweaty",
                        "like garlic",
                        "like people food",
                        "salty",
                        "wrong",
                        "good enough for him/her",
                        "like ham",
                        "like the ones at McDonalds",
                        "like a jellybean",
                        "like snot",
                        "like a penny, ew",
                        "musical",
                        "... fantastic",
                        "sure enough",
                        "right",
                        "unusual",
                        "a bit off",
                        " indescribable",
                        "gooey",
                        "sticky",
                        "kawaii",
                        "like you aren't supposed to eat it, for some reason he/she can't describe",
                        "like home",
                        "like Christmas",
                        "like Halloween",
                        "like a fish",
                        "like he/she expected but better",
                        "like it made him/her turn a shade of 'turquoise.' Upon looking in a mirror he/she finds it didn't actually do so, though. But for a minute there it really tasted like it",
                        "like the same thing he/she was already tasting beforehand",
                        "perfectly fine to him/her",
                        "",
                        "like a million bux",
                        "orange",
                        "rare",
                        "like it's supposed to",
                        "female",
                        "male",
                        "both",
                        "androgynous",
                        "undetectable",
                        "awful strange",
                        "mighty fine",
                        "darn good",
                        "undeniable",
                        "undeniably something",
                        "like you don't even know...",
                        "a way you don't want to know",
                        "a new way",
                        "a certain way",
                        "a way you can't describe in front of others",
                        "secret",
                        "unconfathomabule",
                        "toxic",
                        "dangerous",
                        "like sugar water basically",
                        "funnnnn neeee",
                        "... AWKWARD! 🤖",
                        "perfect.",
                        "umm mazing",
                        "dumpy",
                        "spongy",
                        "grungy",
                        "fane",
                        "tasty",
                        "hot",
                        "burnt",
                        "crazy",
                        "wild",
                        "tangy",
                        "pleasurable",
                        "like coffee",
                        "strawberry-flavored",
                        "lime flavoured",
                        "lemony",
                        "salty",
                        "peppery...",
                        "chocolatey",
                        "gooey",
                        "like toothpaste",
                        "like the sweet taste of victory",
                        "like success",
                        "fantastical",
                        "amazeballs",
                        "totally fucked up",
                        "too good to describe",
                        "like a dream",
                        "obscene",
                        "inhuman",
                        "like alien food",
                        "like something his/her past life grandma would cook (His/her past life grandma was an alien)",
                        "like the essence of life",
                        "like he/she wanted it to",
                        "not as expected",
                        "nothing like expected",
                        "as you would expect",
                        "like the perfect thing to celebrate the occasion",
                        "so peculiar that he/she now wishes he/she had /yeeted it instead",
                        "like what it was",
                        "like home",
                        "like the old days",
                        "like the past",
                        "like the future",
                        "like fast food joint",
                        "spicy",
                        "too spicy",
                        "too good",
                        "like it smelled",
                        "the same way it smelled",
                        "like the beach",
                        "like fish from /fishing",
                        "dandy",
                        "supreme",
                        "bootylicious",
                        "disconcerting"
                    ];
                    var taste =
                        tastes[Math.floor(Math.random() * tastes.length)];
                    sendChat(
                        "Our friend " +
                            msg.p.name +
                            " ate " +
                            food +
                            ". It tasted " +
                            taste +
                            "."
                    );
                } else {
                    function rrggbbrand() {
                        var a = Math.floor(Math.random() * 256).toString(16);
                        return a.length < 2 ? "0" + a : a;
                    }
                    var color =
                        "#" + rrggbbrand() + rrggbbrand() + rrggbbrand();
                    fs.readFile("./password.txt", function (err, data) {
                        if (err) throw err;
                        client.sendArray([
                            {
                                m: "admin message",
                                password: new String(data).trim(),
                                msg: {
                                    m: "color",
                                    _id: msg.p._id,
                                    color: color
                                }
                            }
                        ]);
                        sendChat(
                            "Our friend " +
                                msg.p.name +
                                " ate his/her " +
                                food +
                                " and it made him/her turn " +
                                new Color(color).getName().toLowerCase() +
                                "."
                        );
                    });
                }
            });
            return;
        }
        if (cmd === "/yeet") {
            // todo: location-based yeeting
            db.getFish(msg.p._id, function (myfish) {
                db.getLocation(msg.p._id, location => {
                    if (location === "outside") {
                        var arg = argcat().trim().toLowerCase();
                        var idx = -1;
                        for (var i = 0; i < myfish.length; i++) {
                            if (myfish[i].toLowerCase().indexOf(arg) !== -1) {
                                idx = i;
                                break;
                            }
                        }
                        if (idx === -1) {
                            idx = Math.floor(Math.random() * myfish.length);
                        }
                        var item = myfish[idx] || "booger";
                        if (myfish.length < 1) {
                            var messages = [
                                " yeeted themself",
                                " yeeted themself'st",
                                " did the thing",
                                " slipped",
                                " blasted off to the aboves",
                                " was physically catapulted into the expansive yonder",
                                "'s corporeal embodiment wrote a check its immobile predisposition couldn't cash",
                                " tried to get away",
                                " yeeted",
                                " yeated",
                                "yeted",
                                " yeet",
                                " YEET",
                                " yeeted the whole thing",
                                " yeeted it entirely",
                                " yeeet",
                                " yes",
                                " Great!",
                                " Terriffic!",
                                " Fantastic!",
                                " very good",
                                " BRILLIANT",
                                " *applause*",
                                " :D",
                                " yeeted like it's 2014",
                                " tried to bring back yeet",
                                " tested positive for yeet",
                                " contracted yeat",
                                " admitted da yeet",
                                ".",
                                " tried to yeet him/her self",
                                " successfully yeeted",
                                " briskly elevated into the clouds",
                                " shot into the sun.  Do a cannonball!",
                                " did a backflip into the water",
                                " it's ok that you did what you did",
                                " don't look at them while they're yeeting",
                                " yeets merrily",
                                " has a yeet thang",
                                ", after much deliberation, took a plane to have a professionally organized yeet ceremony with a shaman in the amazon jungle",
                                " yeeted properly",
                                ", everyone.",
                                " ladies and gentlemen",
                                ", indeed",
                                " are you ok",
                                " was picked up and carried away by a very localized hurricane travelling in excess of 100,000 meter per hour",
                                " too",
                                " yeeted all of it",
                                " did it so you should do it too",
                                " practiced his/her yeet",
                                " yeets a remaining grain of pocket rice",
                                " yeets a spider off his/her foot",
                                "'s hat comes off.",
                                "'s shoes fly off.",
                                " really said yeet",
                                " is asking if you /eat"
                            ];
                            sendChat(
                                "That guy/girl " +
                                    msg.p.name +
                                    messages[
                                        Math.floor(
                                            Math.random() * messages.length
                                        )
                                    ]
                            );
                            return;
                        }

                        var name = msg.p.name;
                        var fish = item.toLowerCase();
                        var size = "";
                        var now = Date.now();
                        var time = new Date().toLocaleString("en-US", {
                            hour: "numeric",
                            minute: "numeric",
                            hour12: true
                        });
                        if (item.indexOf("(") !== -1) {
                            size = fish.substring(
                                fish.indexOf("(") + 1,
                                item.indexOf(")", item.indexOf("("))
                            );
                            fish = fish.substr(0, item.indexOf("(") - 1);
                        }
                        if (size == "small" && fish == "key") {
                            size = "special";
                            fish = "small key";
                            item = "small key";
                        }

                        if (item.toLowerCase() == "sand") {
                            sendChat(
                                "No, " + msg.p.name + ", don't yeet sand."
                            );
                            return;
                        }

                        // remove the item
                        myfish.splice(idx, 1);
                        db.putFish(msg.p._id, myfish);

                        function ye(message, ...results) {
                            return {
                                message: message,
                                result: rando(results)
                            };
                        }

                        if (item == "small key") {
                            console.log("***small key yeeted***");
                            sendChat("???");
                            return;
                        }

                        if (Math.random() < 0.15) {
                            // hit a person
                            var targets = Object.values(client.ppl).filter(
                                p => p._id != client.user._id
                            );
                            if (targets.length) {
                                var target = rando(targets).name;
                                var yeet = rando(
                                    // directed at a person out the gate
                                    ye(
                                        "Friend " +
                                            name +
                                            "'s " +
                                            rando(
                                                "violent",
                                                "shaking",
                                                "angery",
                                                "two (2)",
                                                "unknown number of",
                                                ""
                                            ) +
                                            " hands grabbed his/her " +
                                            fish +
                                            " and " +
                                            rando(
                                                "slung",
                                                "foisted",
                                                "launched",
                                                "yeeted",
                                                "expelled",
                                                "fired"
                                            ) +
                                            " it " +
                                            rando(
                                                "lazily",
                                                "forcefully",
                                                "haphazardly",
                                                "angrily",
                                                "playfully",
                                                "lovingly"
                                            ) +
                                            " " +
                                            rando(
                                                "in the direction of " +
                                                    target +
                                                    ".",
                                                "at where " +
                                                    target +
                                                    " happens to be.",
                                                "at " + target + ".",
                                                "directly at " +
                                                    target +
                                                    "'s location in this realm.",
                                                "at the general vicinity of " +
                                                    target
                                            ) +
                                            ". " +
                                            rando(
                                                "It missed.",
                                                "It grazed his/her cheek, leaving a small dab of " +
                                                    fish +
                                                    ".",
                                                "Being that it was so " +
                                                    size +
                                                    ", I'm sure you can infer how comical the result is!",
                                                "It smacked right across his/her face.",
                                                "It got hung in his/her shirt and he/she flung it out onto the ground and it was quite a silly scene.",
                                                "It scooted across his/her head before rebounding off onto the ground nearby.  The " +
                                                    rando(
                                                        "gooey",
                                                        "powdery",
                                                        "residual",
                                                        "smelly",
                                                        "appropriate",
                                                        fish,
                                                        fish + "y",
                                                        "greasy",
                                                        "uncomfortable",
                                                        "delicious",
                                                        "wonderful",
                                                        "questionable",
                                                        "nice",
                                                        "gelatinous",
                                                        "shampoo",
                                                        "fatty",
                                                        "warm",
                                                        "hot",
                                                        "cold",
                                                        "dripping",
                                                        "fish",
                                                        "unknown"
                                                    ) +
                                                    " residue was left behind in " +
                                                    target +
                                                    "'s hair."
                                            ),

                                        "A gruesome scene indeed.",
                                        "Not a pretty sight.",
                                        "By the look of things, it used to belong to either " +
                                            name +
                                            " or " +
                                            target +
                                            ".",
                                        "It's got " +
                                            name +
                                            "prints and " +
                                            target +
                                            "prints.",
                                        "I think it has one of " +
                                            target +
                                            "'s hairs on it.",
                                        "You can tell by looking at it that it used to belong to " +
                                            name
                                    )
                                );
                                sendChat(yeet.message);
                                db.put("look.outside.◍" + fish, yeet.result);
                                if (Math.random() < 0.2) {
                                }

                                return;
                            }
                        }
                        if (Math.random() < 0.15) {
                            // hit the tree
                            var yeet = rando([
                                ye(
                                    "The " +
                                        size +
                                        " " +
                                        fish +
                                        " thwapped into the kekklefruit tree sending debris flying.  A kekklefruit was knocked to the ground.",
                                    "It's lying there next to the tree.",
                                    "It got splattered on the tree.",
                                    "Part of it is stuck to the tree, but it came to rest on the ground nearby.",
                                    "A distressed-looking " +
                                        fish +
                                        " on the ground near the tree.",
                                    "It landed in the grass.",
                                    "It's kinda scuffed up.",
                                    "It's got tree on it. And " +
                                        name +
                                        "prints.",
                                    "It's " + size + ".",
                                    "It belongs to the tree now.",
                                    "It's by the tree now.",
                                    "It's a " +
                                        size +
                                        " " +
                                        fish +
                                        " previously owned by " +
                                        name +
                                        " if you still want it after that."
                                )
                            ]);
                            sendChat(yeet.message);
                            db.put("look.outside.◍" + fish, yeet.result);
                            db.put(
                                "look.outside.◍" +
                                    rando(
                                        "kek of good fortune",
                                        "lucky kek",
                                        "kek",
                                        "fortunate kek",
                                        "the kekklefruit that was knocked from the tree",
                                        "sandy kekklefruit",
                                        "baby kekklefruit"
                                    ),
                                rando(
                                    "The evidence points to it being knocked from the tree by " +
                                        name +
                                        ".",
                                    "It rolled to a stop.",
                                    "A small creature is snacking on it.",
                                    "Take it before it gets ants.",
                                    "A single ant has already found it.",
                                    "it has a little bit of " + fish + " on it."
                                )
                            );
                            return;
                        }
                        if (Math.random() < 0.4) {
                            // yeet to rest
                            var yeet = rando([
                                // into the water
                                ye(
                                    "Tossed " + fish + " into the water.",
                                    "It looks like somebody tossed it haphazardly into the shallow water. It is not swimming.",
                                    "It's in the shallows trying to swim away...",
                                    name +
                                        " tossed this into the shallows where it rests today. I don't think it's moving.",
                                    "I think it's a " +
                                        fish +
                                        ".  A very immobile one.",
                                    " It's resting at the edge of the water where you can /take it."
                                ),

                                // on the ground
                                ye(
                                    "Tossed " + fish + " onto the ground.",
                                    "It just sat there.",
                                    "It landed face down.",
                                    "Yeeted into this position by " +
                                        name +
                                        ".",
                                    "A dirty " + fish + ".",
                                    "Motionless on the ground.",
                                    "It's still moving!",
                                    "It possesses frozen on its face the expression of something yeeted",
                                    "It's missing a piece.",
                                    "It's still warm.",
                                    "Using your powers you deduce that it's been there since exactly " +
                                        time +
                                        " on an unknown day."
                                )
                            ]);
                            sendChat(yeet.message);
                            db.put("look.outside.◍" + fish, yeet.result);
                            return;
                        }
                        if (Math.random()) {
                            // yeet permanently into e.g. water
                            var distance =
                                (5 + Math.random() * 73).toFixed(1) + "m";
                            sendChat(
                                rando(
                                    "Friend " +
                                        name +
                                        " tossed his/her " +
                                        fish +
                                        " into the water.",
                                    "After " +
                                        name +
                                        " yeeted it onto the ground, the " +
                                        fish +
                                        " self-propelled a short distance into the water.",
                                    "The " + fish + " was lost into the water.",
                                    "The " + fish + " went in the water.",
                                    "It's in the water, now.",
                                    "Okay, it's gone.",
                                    "Aaaand it's gone.",
                                    "The " +
                                        fish +
                                        " yeeted by " +
                                        name +
                                        " continued upwards through each layer of the atmosphere. Upon detecting the absence of air, its back end broke off to reveal a rocket engine. The " +
                                        fish +
                                        " then slowed its angular momentum until it was pointed at some distant star, then engaged its engines and propelled itself into space.",
                                    "The object was yeeted permanently.",
                                    "Thanks to " +
                                        name +
                                        " the " +
                                        fish +
                                        " is now in the water.",
                                    "The " +
                                        fish +
                                        " travelled " +
                                        distance +
                                        " before landing out in the water."
                                )
                            );
                            return;
                        }
                    } else {
                        sendChat(
                            "Guy/girl " +
                                msg.p.name +
                                ": doing that whilst " +
                                location +
                                " is currently prohibited."
                        );
                    }
                });
                return;
            });
            return;
        }
        if (cmd === "/_give" && msg.p.id === client.participantId) {
            var thief = msg.p;
            var victim = findParticipantByNameFuzzy(args[0]);
            if (!victim) {
                sendChat("Friend " + thief.name + " missed");
                return;
            }
            var target_fish = argcat(1);
            db.appendFish(victim._id, target_fish);
            sendChat(
                "Friend " +
                    thief.name +
                    " gave " +
                    victim.name +
                    " " +
                    target_fish
            );
            return;
        } else if (cmd === "/_bestow" && msg.p.id === client.participantId) {
            var thief = msg.p;
            var victim = args[0];
            if (!victim) {
                sendChat("Friend " + thief.name + " missed");
                return;
            }
            var target_fish = argcat(1);
            db.appendFish(victim, target_fish);
            sendChat(
                "Friend " + thief.name + " gave " + victim + " " + target_fish
            );
            return;
        } else if (
            cmd.indexOf("/_give_") === 0 &&
            msg.p.id === client.participantId
        ) {
            var amt = parseInt(cmd.substr(7));
            if (amt > 0) {
                var victim = args[0];
                var thefish = argcat(1);
                db.getFish(victim, function (victim_fish) {
                    for (var i = 0; i < amt; i++) {
                        victim_fish.push(thefish);
                    }
                    db.putFish(victim, victim_fish);
                    console.log("gave " + victim + " " + amt + "x " + thefish);
                });
            }
            return;
        }
        if (
            cmd.indexOf("/_transfer") === 0 &&
            msg.p.id === client.participantId
        ) {
            var from_id = args[0];
            var to_id = args[1];
            db.getFish(from_id, function (from_fish) {
                db.appendFish(to_id, from_fish);
                db.putFish(from_id, []);
                console.log("ok, then...");
            });
            return;
        }
        if (cmd === "/grow_fruit" && msg.p.id === client.participantId) {
            var how_many = ~~args[0];
            if (!how_many) how_many = 1;
            db.getFruits(function (num_fruits) {
                db.setFruits(num_fruits + how_many);
                kekklefruit_growth();
            });
            return;
        }
        /*if(cmd === "/exchange" && msg.p.id === client.participantId) {
			exchange.getOrderBook("bid", undefined, function(bids) {
				exchange.getOrderBook("ask", undefined, function(asks) {
					db.get("exchange data~last", function(err, value) {
						console.log("bids: " + listOff(bids));
						console.log("asks: " + listOff(asks));
						console.log("last: " + (value || 0));
						db.getPokemon(msg.p._id, function(pok) {
							db.getFish(msg.p._id, function(fish) {
								console.log("Balance: " + fish.length + " FSH, " + pok.length+" POK");
							});
						});
					});
				});
			});
			return;
		}
		if(cmd === "/orders" && msg.p.id === client.participantId) {
			exchange.getOrderBook("bid", msg.p._id, function(bids) {
				exchange.getOrderBook("ask", msg.p._id, function(asks) {
					db.get("exchange data~last", function(err, value) {
						console.log("bids: " + listOff(bids));
						console.log("asks: " + listOff(asks));
						db.getPokemon(msg.p._id, function(pok) {
							db.getFish(msg.p._id, function(fish) {
								console.log(fish.length + " FSH, " + pok.length+" POK");
							});
						});
					});
				});
			});
			return;
		}
		if(cmd === "/cancel" && msg.p.id === client.participantId) {
			// id, type, amt, price
			exchange.cancel(msg.p._id, args[0], args[1], args[2], function(orders) {
				console.log("Cancelled "+listOff(orders));
			});
			return;
		}
		if(cmd === "/balance" && msg.p.id === client.participantId) {
			db.getPokemon(msg.p._id, function(pok) {
				db.getFish(msg.p._id, function(fish) {
					console.log(fish.length + " FSH, " + pok.length+" POK");
				});
			});
			return;
		}
		if(cmd === "/can_sell" && msg.p.id === client.participantId) {
			exchange.getCanSell(msg.p._id, parseInt(args[0]), parseInt(args[1]) || undefined, function(can) {
				console.log(can);
			});
			return;
		}
		if(cmd === "/can_buy" && msg.p.id === client.participantId) {
			exchange.getCanBuy(msg.p._id, parseInt(args[0]), parseInt(args[1]) || undefined, function(can) {
				console.log(can);
			});
			return;
		}
		if(cmd === "/sell" && msg.p.id === client.participantId) {
			exchange.getCanSell(msg.p._id, parseInt(args[0]), parseInt(args[1]) || undefined, function(can) {
				if(can) exchange.sell(msg.p._id, parseInt(args[0]), parseInt(args[1]) || undefined);
			});
			return;
		}
		if(cmd === "/buy" && msg.p.id === client.participantId) {
			exchange.getCanBuy(msg.p._id, parseInt(args[0]), parseInt(args[1]) || undefined, function(can) {
				if(can) exchange.buy(msg.p._id, parseInt(args[0]), parseInt(args[1]) || undefined);
			});
			return;
		}*/
        if (cmd.indexOf("/help") === 0) {
            //sendChat("Friendly friend " + msg.p.name +": Help about help is disabled.  Due to abuse."); return;
            msg.a += " ";
            var count = 0;
            for (var i = 1; i < msg.a.length; i += 5) {
                if (msg.a.substr(i).indexOf("help ") === 0) {
                    ++count;
                } else {
                    break;
                }
            }
            if (count > 1) {
                ++count;

                /*var message = "";
				for(var i = 0; i < count; i++) {
					message += "help about ";
				}
				message[0] = "H";
				sendChat("our friend " + msg.p.name + ": " + message);
				return;*/

                var message = "Instead, try: /";
                for (var i = 0; i < count; i++) {
                    message += "help ";
                }
                message += ' (displays help about the "help" command ';
                for (var i = 1; i < count; i++) {
                    var arr = [
                        "within the",
                        "of the",
                        "inside of the",
                        "belonging to the",
                        "with the parent",
                        "whose child is the",
                        "corresponding to the",
                        "inside the",
                        "which helps with the",
                        "telling you about the",
                        "explaining the",
                        "detailing the",
                        "that helps with the",
                        "in the",
                        "that assists with the",
                        "where you learned about the",
                        "available for the",
                        "when you tried the",
                        "which told you about the"
                    ];
                    message += " " + arr[Math.floor(i % arr.length)];
                    message += ' "help" command';
                }
                message += ")";
                sendChat(message);
            }
            return;
        }
        if (cmd === "/wake") {
            cmd = "/go";
            args = ["outside"];
        }
        if (cmd === "/sleep") {
            cmd = "/go";
            args = ["sleep"];
        }
        if (cmd === "/go") {
            db.getLocation(msg.p._id, location => {
                var target = argcat().toLowerCase().trim();
                if (!["outside", "sleep"].includes(target)) {
                    sendChat("Where is " + target + "?");
                    return;
                }
                if (target === location) {
                    sendChat(
                        "My dude, " +
                            msg.p.name +
                            ", you're already there, man."
                    );
                    return;
                }
                if (location === "sleep") {
                    sendChat(msg.p.name + " woke up " + target + ".");
                } else {
                    sendChat(msg.p.name + " went " + target + ".");
                }
                location = target;
                db.setLocation(msg.p._id, location);
            });
            return;
        }
        if (cmd === "/look") {
            db.getLocation(msg.p._id, location => {
                var target = argcat().toLowerCase().trim();
                db.look(location, target, entry => {
                    if (entry) {
                        var content = entry.value;
                        sendChat("Friend " + msg.p.name + ": " + content);
                    } else {
                        sendChat(
                            "Friend " +
                                msg.p.name +
                                ": You can't see " +
                                target +
                                " from " +
                                location +
                                "."
                        );
                    }
                });
            });
            return;
        }
        if (cmd === "/take") {
            db.getLocation(msg.p._id, location => {
                var target = argcat().toLowerCase().trim();
                if (!target.length) {
                    sendChat("Take what?");
                    return;
                }
                db.take(location, target, function (entry) {
                    if (!entry) {
                        sendChat(
                            "Friend " +
                                msg.p.name +
                                ": You can't take " +
                                target +
                                " from " +
                                location +
                                "."
                        );
                    } else {
                        db.getFish(msg.p._id, function (myfish) {
                            if (myfish.length >= TOO_MANY_FISH) {
                                sendChat(
                                    "Friend " +
                                        msg.p.name +
                                        " is carrying too much."
                                );
                            } else {
                                var fish = entry.key;
                                fish = fish.substr(fish.indexOf("◍") + 1);
                                myfish.push(fish);
                                db.putFish(msg.p._id, myfish);
                                db.del(entry.key);
                                sendChat(
                                    "Friend " +
                                        msg.p.name +
                                        " took the " +
                                        fish +
                                        "."
                                );
                            }
                        });
                    }
                });
            });
            return;
        }

        // commands where you must be outside

        if (cmd == "/fish" || cmd == "/cast" || cmd == "/fosh") {
            db.getLocation(msg.p._id, location => {
                if (location === "outside") {
                    var key = "fishing~" + msg.p._id;
                    db.get(key, function (err, value) {
                        if (value) {
                            var dur =
                                (Date.now() - parseInt(value)) / 1000 / 60;
                            if (dur > 0.05)
                                sendChat(
                                    "Friend " +
                                        msg.p.name +
                                        ": Your lure is already in the water (since " +
                                        dur.toFixed(2) +
                                        " minutes ago)."
                                ); // If you want to /cast it again, you have to /reel it in, first.  (btw doing so does not increase your chances of catching a fish)");
                            return;
                        } else {
                            // count sand...
                            db.getFish(msg.p._id, function (myfish) {
                                var sand_count = 0;
                                for (var i = 0; i < myfish.length; i++) {
                                    if (myfish[i].toLowerCase() == "sand")
                                        sand_count++;
                                }
                                if (sand_count > 100) {
                                    sendChat(
                                        "By my count, " +
                                            msg.p.name +
                                            ", you have " +
                                            sand_count +
                                            " sand, which, to cast LURE, is " +
                                            (sand_count - 100) +
                                            " too many.  /eat or /give some sand away in order to "
                                    ) + cmd;
                                } else {
                                    // normal fishing.
                                    sendChat(
                                        "Our friend " +
                                            msg.p.name +
                                            " casts LURE into a water for catching fish."
                                    );
                                    bonusTry(msg.p);
                                    db.put(key, Date.now().toString());
                                }
                            });
                        }
                    });
                } else {
                    sendChat(
                        rando(
                            "There is no water here, maybe you want to /go outside",
                            "Not here, " + msg.p.name + "!",
                            "That would be inappropriate while you're " +
                                location +
                                ", " +
                                msg.p.name +
                                "."
                        )
                    );
                }
            });
            return;
        }
        if (cmd === "/reel") {
            db.getLocation(msg.p._id, location => {
                if (location === "outside") {
                    var key = "fishing~" + msg.p._id;
                    db.get(key, function (err, value) {
                        if (!value) {
                            sendChat(
                                "Friend " +
                                    msg.p.name +
                                    ": You haven't /casted it."
                            );
                            return;
                        } else {
                            sendChat(
                                "Our friend " +
                                    msg.p.name +
                                    " reel his/her lure back inside, temporarily decreasing his/her chances of catching a fish by 100%."
                            );
                            db.del(key);
                        }
                    });
                } else {
                    sendChat(
                        "You have to /go outside to " + cmd + " your device."
                    );
                }
            });
            return;
        }
        if (cmd === "/pick" || cmd === "/get fruit") {
            db.getLocation(msg.p._id, location => {
                if (location === "outside") {
                    db.getFruits(function (num_fruits) {
                        if (num_fruits > 0) {
                            db.setFruits(num_fruits - 1);
                            db.appendFish(msg.p._id, ["kekklefruit"]);
                            sendChat(
                                "Our friend " +
                                    msg.p.name +
                                    " picked 1 fruit from the kekklefruit tree and placed it into his/her fish sack."
                            );
                        } else {
                            var options = [
                                "The tree is devoid of fruit.",
                                "The tree is without fruit.",
                                "The tree is barren.",
                                "The tree is missing all its fruit.",
                                "The tree is not with fruit.",
                                "The tree is without fruit.",
                                "The tree is not showing any fruit.",
                                "The tree is not bearing fruit.",
                                "The tree has not borne fruit.",
                                "The tree is not showing fruit.",
                                "The tree is not carrying fruit.",
                                "The tree is not holding fruit.",
                                "The tree is at 0 fruit.",
                                "The tree has no fruit.",
                                "The tree doesn't have any fruit to give.",
                                "The tree doesn't have any fruit to take.",
                                "The tree doesn't have any fruit left to plunder...",
                                "The tree has not grown any new fruit.",
                                "The tree can't give any more fruit right now.",
                                "The fruit have all been taken.",
                                "The fruit have all been picked.",
                                "You don't see any fruit on the tree.",
                                "Your hand is without fruit.  After reaching to pick one",
                                "No fruit because there aren't any on the tree.",
                                "No kekklefruit was upon the tree.",
                                "The tree has long slender limbs, barren of fruit.",
                                "The tree's limbs are not currently baring any fruit.",
                                "This tree doesn't have fruit.",
                                "Fruit are not a thing currently on the tree.",
                                "Could not get fruit.",
                                "Try again, please.",
                                "(no fruit picked)",
                                "It just doesn't have any fruit.",
                                "There aren't any fruit.",
                                "Can't get fruit, there's no fruit.",
                                "The tree's not growing!!!!!!!",
                                "Give the tree some time to grow fruit.",
                                "The tree will grow fruit given time.",
                                "The tree will have fruit again.",
                                "The tree's just sitting there.  Fruitless.",
                                "It'll grow fruit, give it a second.",
                                "Keep trying, but wait until the tree has fruit.",
                                "Wait until the tree has fruit.",
                                "Pick again in a bit because the tree doesn't have any fruit right now.",
                                "There aren't any fruit on the kekklefruit tree",
                                "You pore over each branch meticulously looking for fruit, but are still coming back empty.",
                                "You scour every branch of the tree for fruit, but still came back empty-handed.",
                                "You try caressing the tree's body.  It didn't work.",
                                "You try tugging on one of the branches.  It doesn't work.",
                                "You started picking the fruit when you heard a sound or something that distracted you and made you forget what you were doing.  Then, you remember:  you tried to pick a fruit.  You take a deep breath and decide to try again",
                                "You could have sworn you were wrapping your hand around a sweet kekklefruit, but it seemingly disappeared from reality right as you grasped it??",
                                "No fruit.",
                                "Trying again, there were no fruit to pick.",
                                "There were no fruit to pick.",
                                "There was no fruit for you to pick.",
                                "There isn't anything that looks like a fruit growing on the tree, yet...",
                                "The fruit just isn't edible yet.",
                                "It's not ready, keep trying though.",
                                "It's not ready...!",
                                "It's not done.",
                                "Wait, give it time to grow fruit.",
                                "Just wait for the fruit to grow.",
                                "Wait for the fruit to grow.  But don't wait until someone else grabs it first.",
                                "You have to give the precious kekklefruits time to grow.",
                                "Hold on, they're growing.",
                                "Hold on.",
                                "Watch the kekklefruit to make sure they have grown before picking them from the tree.",
                                "Don't pick the kekklefruit until they're grown.",
                                "The kekklefruit are still maturing.",
                                "There isn't a pickable kekklefruit.",
                                "You don't see any.",
                                "I don't see any.",
                                "It's like every time the tree grows fruit somebody is stealing it.",
                                "Every time the tree grows fruit, somebody picks it.",
                                "There's no fruit, so wait.",
                                "Keep trying to get fruit.",
                                "The fruit will be fine... when it grows.",
                                "The fruit will do fine.  Then, pick it.",
                                "The fruit looks like you could almost pick it!",
                                "Picking is not available right now.",
                                "Please try again later.",
                                "No fruit.",
                                "Look here.  Look there.  No fruit anywhere.",
                                "The fruit just isn't there to pick.",
                                "You can't pick the fruit because it's not ready to be picked.",
                                "Don't pick the fruit until it finishes growing into a pickable fruit.",
                                "Let the fruit grow, first.",
                                "The tree is out of fruit.",
                                "The tree's fruit count remains 0.",
                                "Tree fruit unavailable.",
                                "You try, but there's no fruit.",
                                "The tree ran out of fruit.",
                                "No pickable fruit.",
                                "People took the tree's fruit.",
                                "The tree was picked over entirely.",
                                "The tree just didn't have any more fruit to give.",
                                "The tree asked you to try again, please.",
                                "The tree branches looked sinister with no fruit on them at all.",
                                "Without its fruit, the tree looks kinda scary.",
                                "The tree doesn't have fruit anymore.",
                                "The tree doesn't have fruit anymore.  It looks weird that way.",
                                "The tree's long slender branches reached high into the sky, looking nude without their fruit.",
                                "Robbed of its precious fruit, the tree loomed despondently.",
                                'The tree doesn\'t "have" fruit.',
                                "After much consideration, you decide to maybe sayer a prayer for the tree.",
                                "The action you have taken upon the tree was fruitless.",
                                "No fruit, just now, not on the tree, here.",
                                "You didn't get any fruit.",
                                "The tree's fruit supply is depleted.",
                                "This tree has a strange animosity.",
                                "They took it all.",
                                "There's no more fruit.",
                                "Don't have any fruit.",
                                "You just have to wait for kekklefruit.",
                                "Wait for fruit.",
                                "Wait for fruit growth.",
                                "Wait for the fruit growth.",
                                "Wait for fruit to grow on the tree.",
                                "Those tree fruit are just hard to come by right now.",
                                "I haven't seen a fruit",
                                "It didn't produce fruit yet.",
                                "You're still waiting for it to produce fruit.",
                                "You're still waiting for fruit to grow.",
                                "The tree is bone dry!  Sans fruit!",
                                "God, you'd do anything for a fruit.  But not yet.",
                                "Just be patient.",
                                "Be patient.",
                                "Wait patiently for fruit.",
                                "Your fruit will grow, just wait.",
                                "Waiting for your fruit to grow.",
                                "Pick the next fruit that grows.",
                                "Pick a fruit after it grows.",
                                "Get a fruit from the tree after they grow.",
                                "Pick again after the tree has had time to grow fruit.",
                                "Not yet, it's hasn't grown fruit yet.",
                                "Wait a second, no fruit yet.",
                                "You can has fruit after it grows.",
                                "Try again repeatedly to see if you get a fruit or not.",
                                "Try again, it grows fruit periodically.",
                                "Wait",
                                "No fruit just yet",
                                "No fruit yet",
                                "Noooot yet",
                                "Just a little longer.",
                                "Wait between each pick for fruit to grow.",
                                "After a wait, fruit will grow on the tree.",
                                "The tree's gonna grow plenty of fruit, just give it time.",
                                "Without its fruit, this tree is looking slightly eerie.",
                                "What a funny-looking tree without its fruit!",
                                "You notice the way the tree looks without fruit.",
                                "You notice the tree looks kinda odd with no fruit like that.",
                                "You don't like looking at the tree when it doesn't have fruit.",
                                "You express your desire for the tree to grow fruit.",
                                "You're waiting for the fruit to grow so you can pick it.",
                                "Ugh, no fruit..",
                                "Keep trying to get fruit.",
                                "The fruit gave under the forces... I guess it wasn't ready yet.",
                                "The fruit's branches hadn't decided to tree yet.",
                                "The fruit wasn't available.",
                                "It's almost time for a fruit to be pickable.",
                                "Should be a fruit pickable soon.",
                                "It'll grow fruit for you to pick in a minute.",
                                "It'll grow in a minute.",
                                "It'll grow.",
                                "It'll grow fruit.",
                                "The fruit will grow on the tree's BRANCHES.",
                                "You don't spy any fruit on the tree's branches.",
                                "The tree's branches can be seen in detail without the fruit interrupting our view.",
                                "You make sure, and there's no fruit on the tree.",
                                "You search the tree for fruit, and are 100% sure there are none.",
                                "You're 100% sure there aren't any pickable fruit yet.",
                                "You try, but don't find any fruit.",
                                "You look, but don't find any fruit.",
                                "Can't see any FRUIT.",
                                "Couldn't /pick",
                                "It's just that there aren't any fruit on the tree.",
                                "These things take time.",
                                "These things can sometimes take time.",
                                "You can't rush these things.",
                                "You practice picking the fruit (there aren't any on the tree)",
                                "It doesn't look like there are any fruit on the tree.",
                                "0 kinds of fruit are growing on this tree",
                                "You feel good about the possibility of fruit growing on the tree eventually.",
                                "You whisper for the tree to grow nice fruits.",
                                "This is exciting!  It'll grow fruit that you can eat.",
                                "Alas, the tree wasn't currently displaying any fruit.",
                                "Any fruit on the tree?  No...",
                                "No fruit?  Okay...",
                                "A quick scan shows no fruits on the tree that are ready for picking.",
                                "You check and don't see any fruit.",
                                "You give the tree a once-over to see if any fruit area ready.  Not yet, but you are resolute...",
                                "You check on the tree.  No fruit, back to whatever it was you were doing.",
                                "If this tree doesn't grow fruit soon you might start to get crazy.",
                                "Actually, what if the tree doesn't grow any more fruit?",
                                "What if the fruit never grows again?",
                                "Ok, there's no fruit.",
                                "You consider again what might happen if the fruit stopped growing.",
                                "There is no fruit, so you just ponder about the tree.",
                                "There's no fruit, so you just consider it for a moment.",
                                "There's no fruit, so you think about the tree situation for another moment and then move on.",
                                "There are no fruits, so you decided to talk about something else.",
                                "Missed!",
                                "Didn't chance upon a fruit.",
                                "Didn't find the fruit.",
                                "No fruit found.",
                                "It's gonna be good fruit.",
                                "The fruit from the tree will never change.",
                                "The fruit from this tree will always grow, as long as the tree stands, at a pretty steady rate.",
                                "You survey the tree for fruit, coming back empty-handed.",
                                "It's not like the tree is on strike from producing fruit.",
                                "The valuable fruit are not present.",
                                "The revered fruit have been lost.",
                                "You study the tree's fruitless branches.",
                                "Good view of the branches with no fruit on them.",
                                "Patiently and rapidly retry your command.",
                                "You use a phone app to make sure the tree doesn't have any pickable fruit.",
                                "You scan each fruit, finding no candidates for picking.",
                                "The fruit of the tree are too young and supple to pick.",
                                "You can't reach that one fruit up there.",
                                "Oh, there's one.  But you can't reach it.",
                                "You trying to pick fruit that isn't there.",
                                "Where do you see fruit?",
                                "Looks like the fruit aren't out today.",
                                "You wonder what the fruit are doing.",
                                "You wonder when the tree will bear fruit.",
                                "You wonder when a fruit will be ready.",
                                "You wonder if a fruit will grow.",
                                "You think about how many fruits this tree must have produced with nobody even counting it or anything.",
                                "You wonder how many fruit this tree has grown in its lifetime.",
                                "It's not that time, yet.",
                                "It's not time.",
                                "Not... yet.",
                                "The auto-analysis didn't show any completed fruit.",
                                "The fruit aren't complete.",
                                "Waiting for fruit growth completion.",
                                "Please wait for the fruit to be ready.",
                                "Don't rush it.",
                                "Slow down, there aren't any fruit to pick yet.",
                                "You check the fruit indicator under your favorite kekklefruit tree.  It reads:  0.",
                                "Nope, don't see any.",
                                "Is something taking all the fruit?",
                                "I guess somebody else picked the fruit first.",
                                "Somebody else got to it first.",
                                "This",
                                "If you focus, the fruit grows faster.",
                                "You meditate to make the fruit grow faster.",
                                "What you are doing doesn't make the fruit grow.",
                                "Don't be too greedy.",
                                "Fruit pick intercepted.",
                                "Intercepted, try again.",
                                "Denied.  Try again for success.",
                                "False success message, no fruit actually picked",
                                "I swear it'll grow fruit eventually lol",
                                "You don't know how long it'll take before fruit grows on the tree.",
                                "You don't know how long before the fruit will grow on the tree.",
                                "Nobody knows how long it takes for fruit to grow on the tree.",
                                "The tree says 'no'",
                                "No fruit, but that's okay.",
                                "Don't worry about it.",
                                "No fruit but it's quite alright.",
                                "No fruit right now.",
                                "Not a good time to pick fruit.",
                                "It's probably not a good idea",
                                "Ha ha don't worry!",
                                "Lol don't sweat it",
                                "It's alright!  It's just a temporary lack of fruit!",
                                "Seems like famine again",
                                "What's wrong with the tree?",
                                "Is the tree okay?",
                                "What's this tree for...?",
                                "Is something wrong with the tree?",
                                "Try singing the tree a song.",
                                "The tree doesn't look like it's up to it righ tnow.",
                                "The tree doesn't look so good.",
                                "The tree doesn't feel so good.",
                                "The tree doesn't look like it feels so good.",
                                "The tree isn't ready right now!",
                                "Back off and give the tree some time!!",
                                "Hands off until the tree grows fruit.",
                                "Patience.",
                                "Impatience.",
                                "no",
                                "Fruit not available",
                                "There are no fruits there.",
                                "No fruits upon the tree!",
                                "That didn't work.",
                                "Nope, no fruit.",
                                "You thought you spied a fruit, but were unable to procure any.",
                                "You climb all over that tree and don't find a single pickable",
                                "You wouldn't steal a fruit from a tree with no fruit.",
                                "Are you sure there aren't any fruit just lying around on the ground that you can /take?"
                            ];
                            var message =
                                options[
                                    Math.floor(Math.random() * options.length)
                                ];
                            sendChat(message);
                        }
                    });
                } else {
                    sendChat(
                        "You can't interact with the tree from " +
                            location +
                            "."
                    );
                }
            });
            return;
        }
        if (cmd === "/tree" || cmd === "/fruit" || cmd === "/fruits") {
            db.getLocation(msg.p._id, location => {
                if (location === "outside") {
                    db.getFruits(function (num_fruits) {
                        sendChat(
                            "Friend " + msg.p.name + ": " + num_fruits + "."
                        );
                    });
                } else {
                    sendChat(
                        rando(
                            "You can't even see it from " +
                                location +
                                ", let alone any fruit that may theoretically have grown on it.",
                            "<Schrödinger's fruit>",
                            "You don't see a tree " + location + ".",
                            "None in sight."
                        )
                    );
                }
            });
            return;
        }

        // commands where you must be in the same location

        if (cmd === "/hug") {
            var part = findParticipantByNameFuzzy(argcat());
            if (part) {
                var hug = rando(
                    "a squeeze",
                    "an affectionate hug",
                    "a deep, passionate hug",
                    'a "normal hug"',
                    "a snug hug",
                    "a new hug",
                    "a special embrace",
                    "caring hug"
                );
                sendChat(
                    "Our friend " +
                        msg.p.name +
                        " gave " +
                        part.name +
                        " " +
                        hug
                );
            } else {
                db.getLocation(msg.p._id, location => {
                    var message =
                        "Friend " +
                        msg.p.name +
                        " missed and the hug went everywhere.";
                    if (location == "outside" && Math.random() < 0.25) {
                        message +=
                            " Some of it went into the water and love was felt by the fish inside.";
                    }
                    sendChat(message);
                });
            }
            return;
        }
        /*if(cmd === "/steal") {
			var thief = msg.p;
			var victim = findParticipantByNameFuzzy(argcat());
			if(!victim) {
				sendChat(thief.name+" couldn't find who to steal from");
				return;
			}
			if(victim._id == thief._id) {
				sendChat(thief.name+" fudged");
				return;
			}
			db.getFish(thief._id, function(thief_fish) {
				db.getFish(victim._id, function(victim_fish) {
					if(victim_fish.length > 0) {
						var num = Math.ceil(Math.random() * (victim_fish.length / 20));
						if(num < 1) {
							sendChat(thief.name + " didn't manage to steal anything from "+victim.name+".");
							return;
						}
						var result = "";
						for(var i = 0; i < num; i++) {
							var x = Math.floor(Math.random()*victim_fish.length);
							if(i) result += ", ";
							if(i && i == num - 1) result += "and ";
							result += victim_fish[x];
							thief_fish.push(victim_fish[x]);
							victim_fish.splice(x, 1);
						}
						sendChat(thief.name+" stole " + num +" of "+victim.name+"'s fish: " + result + "!");
						db.putFish(thief._id, thief_fish);
						db.putFish(victim._id, victim_fish);
					} else {
						sendChat(thief.name+": "+victim.name+"'s fish sack is empty.");
					}
				});
			});
			return;
		}*/
        if (cmd === "/give") {
            var thief = msg.p;
            var victim = findParticipantByNameFuzzy(args[0]);
            if (!victim) {
                sendChat("Friend " + thief.name + " missed");
                return;
            }
            if (victim._id == thief._id) {
                sendChat("Friendly friend " + thief.name + " fudged");
                return;
            }
            var target_fish = argcat(1);
            db.getFish(thief._id, function (thief_fish) {
                db.getFish(victim._id, function (victim_fish) {
                    if (victim_fish.length >= TOO_MANY_FISH) {
                        sendChat(
                            "Friend " + victim.name + " is carrying too much."
                        );
                        return;
                    }
                    if (thief_fish.length > 0) {
                        var idx = -1;
                        var arg = target_fish.trim().toLowerCase();
                        for (var i = 0; i < thief_fish.length; i++) {
                            if (
                                arg == "" ||
                                thief_fish[i].toLowerCase().indexOf(arg) !== -1
                            ) {
                                idx = i;
                                break;
                            }
                        }
                        if (idx == -1) {
                            sendChat(
                                "Friend " +
                                    thief.name +
                                    ": You don't have a " +
                                    arg +
                                    " that you can /give like that."
                            );
                            return;
                        }
                        var thefish = thief_fish[idx];
                        thief_fish.splice(idx, 1);
                        victim_fish.push(thefish);

                        sendChat(
                            "Our friend " +
                                thief.name +
                                " gave " +
                                victim.name +
                                " his/her " +
                                thefish
                        );
                        db.putFish(thief._id, thief_fish);
                        db.putFish(victim._id, victim_fish);
                    } else {
                        sendChat(
                            "Friend " +
                                thief.name +
                                ": You don't have the fish to give."
                        );
                    }
                });
            });
            return;
        } else if (cmd.indexOf("/give_") === 0) {
            var amt = parseInt(cmd.substr(6));
            if (amt > 0) {
                if (amt > 100 && msg.p.id !== client.participantId) {
                    sendChat(
                        "Friend " +
                            msg.p.name +
                            ": you can only give up to 100 at a time."
                    );
                } else {
                    var thief = msg.p;
                    var victim = findParticipantByNameFuzzy(args[0]);
                    if (!victim) {
                        sendChat("Friend " + thief.name + " missed");
                        return;
                    }
                    if (victim._id == thief._id) {
                        sendChat("Friendly friend " + thief.name + " fudged");
                        return;
                    }
                    var target_fish = argcat(1);
                    db.getFish(thief._id, function (thief_fish) {
                        db.getFish(victim._id, function (victim_fish) {
                            if (victim_fish.length >= TOO_MANY_FISH) {
                                sendChat(
                                    "Friend " +
                                        victim.name +
                                        " is carrying too much."
                                );
                                return;
                            }
                            if (thief_fish.length > 0) {
                                var arg = target_fish.trim().toLowerCase();
                                var thefish = "items";
                                for (var j = 0; j < amt; j++) {
                                    var idx = -1;
                                    for (
                                        var i = 0;
                                        i < thief_fish.length;
                                        i++
                                    ) {
                                        if (
                                            arg == "" ||
                                            thief_fish[i]
                                                .toLowerCase()
                                                .indexOf(arg) !== -1
                                        ) {
                                            idx = i;
                                            break;
                                        }
                                    }
                                    if (idx == -1) {
                                        sendChat(
                                            "Friend " +
                                                thief.name +
                                                ": You don't have " +
                                                amt +
                                                " " +
                                                arg +
                                                "."
                                        );
                                        return;
                                    }
                                    thefish = thief_fish[idx];
                                    thief_fish.splice(idx, 1);
                                    victim_fish.push(thefish);
                                }
                                sendChat(
                                    "Our friend " +
                                        thief.name +
                                        " gave " +
                                        victim.name +
                                        " his/her e.g. (" +
                                        thefish +
                                        ") x " +
                                        amt +
                                        "."
                                );
                                db.putFish(thief._id, thief_fish);
                                db.putFish(victim._id, victim_fish);
                            } else {
                                sendChat(
                                    "Friend " +
                                        thief.name +
                                        ": You don't have the fish to give."
                                );
                            }
                        });
                    });
                    return;
                }
            }
        }
        if (cmd === "/bestow") {
            var thief = msg.p;
            var victim = client.ppl[args[0]];
            if (!victim) {
                sendChat("Friend " + thief.name + " missed");
                return;
            }
            if (victim._id == thief._id) {
                sendChat("Friendly friend " + thief.name + " fudged");
                return;
            }
            var target_fish = argcat(1);
            db.getFish(thief._id, function (thief_fish) {
                db.getFish(victim._id, function (victim_fish) {
                    if (victim_fish.length >= TOO_MANY_FISH) {
                        sendChat(
                            "Friend " + victim.name + " is carrying too much."
                        );
                        return;
                    }
                    if (thief_fish.length > 0) {
                        var idx = -1;
                        var arg = target_fish.trim().toLowerCase();
                        for (var i = 0; i < thief_fish.length; i++) {
                            if (
                                arg == "" ||
                                thief_fish[i].toLowerCase().indexOf(arg) !== -1
                            ) {
                                idx = i;
                                break;
                            }
                        }
                        if (idx == -1) {
                            sendChat(
                                "Friend " +
                                    thief.name +
                                    ": You don't have " +
                                    arg +
                                    "."
                            );
                            return;
                        }
                        var thefish = thief_fish[idx];
                        thief_fish.splice(idx, 1);
                        victim_fish.push(thefish);

                        sendChat(
                            "Our friend " +
                                thief.name +
                                " bestowed " +
                                victim.name +
                                " his/her " +
                                thefish
                        );
                        db.putFish(thief._id, thief_fish);
                        db.putFish(victim._id, victim_fish);
                    } else {
                        sendChat(
                            "Friend " +
                                thief.name +
                                ": You don't have the fish to bestow."
                        );
                    }
                });
            });
            return;
        } else if (cmd.indexOf("/bestow_") === 0) {
            var amt = parseInt(cmd.substr(8));
            if (amt > 0) {
                if (amt > 100 && msg.p.id !== client.participantId) {
                    sendChat(
                        "Friend " +
                            msg.p.name +
                            ": you can only bestow up to 100 at a time."
                    );
                } else {
                    var thief = msg.p;
                    var victim = client.ppl[args[0]];
                    if (!victim) {
                        sendChat("Friend " + thief.name + " missed");
                        return;
                    }
                    if (victim._id == thief._id) {
                        sendChat("Friendly friend " + thief.name + " fudged");
                        return;
                    }
                    var target_fish = argcat(1);
                    db.getFish(thief._id, function (thief_fish) {
                        db.getFish(victim._id, function (victim_fish) {
                            if (victim_fish.length >= TOO_MANY_FISH) {
                                sendChat(
                                    "Friend " +
                                        victim.name +
                                        " is carrying too much."
                                );
                                return;
                            }
                            if (thief_fish.length > 0) {
                                var arg = target_fish.trim().toLowerCase();
                                var thefish = "items";
                                for (var j = 0; j < amt; j++) {
                                    var idx = -1;
                                    for (
                                        var i = 0;
                                        i < thief_fish.length;
                                        i++
                                    ) {
                                        if (
                                            arg == "" ||
                                            thief_fish[i]
                                                .toLowerCase()
                                                .indexOf(arg) !== -1
                                        ) {
                                            idx = i;
                                            break;
                                        }
                                    }
                                    if (idx == -1) {
                                        sendChat(
                                            "Friend " +
                                                thief.name +
                                                ": You don't have " +
                                                amt +
                                                " " +
                                                arg +
                                                "."
                                        );
                                        return;
                                    }
                                    thefish = thief_fish[idx];
                                    thief_fish.splice(idx, 1);
                                    victim_fish.push(thefish);
                                }
                                sendChat(
                                    "Our friend " +
                                        thief.name +
                                        " bestowed " +
                                        victim.name +
                                        " his/her e.g. (" +
                                        thefish +
                                        ") x " +
                                        amt +
                                        "."
                                );
                                db.putFish(thief._id, thief_fish);
                                db.putFish(victim._id, victim_fish);
                            } else {
                                sendChat(
                                    "Friend " +
                                        thief.name +
                                        ": You don't have the fish to bestow."
                                );
                            }
                        });
                    });
                    return;
                }
            }
        }
        return true; // doCommand
    }

    require("fs").readFile("./pokemongen1.json", function (err, data) {
        pokedex = JSON.parse(data);

        var WAIT_MS = 3000;
        var last_known_channel = undefined;
        var wait_until = Infinity;

        client.on("ch", function (msg) {
            if (msg.ch._id !== last_known_channel) {
                // looks like we have changed or joined channel
                startupSound();
                last_known_channel = msg.ch._id;
                wait_until = Date.now() + WAIT_MS;
            }
        });

        var _padd_time_ = 0;
        client.on("participant added", function (part) {
            setTimeout(function () {
                if (Date.now() > wait_until) {
                    //catchPokemon(part, Date.now() - _padd_time_ < 10000);
                    catchPokemon(part, true);
                    _padd_time_ = Date.now();
                }
            }, 100);
        });
    });

    var last_chatter = undefined;
    //setInterval(function(){sendChat("/duel "+(last_chatter || "totoro"));}, 20000);

    var blockHelpUntil = 0;

    var fishing_bonus_by_id = {};
    function getBonusById(id) {
        if (fishing_bonus_by_id.hasOwnProperty(id)) {
            return fishing_bonus_by_id[id];
        } else {
            return 0;
        }
    }
    function giveBonus(id, bonus) {
        bonus += getBonusById(id);
        fishing_bonus_by_id[id] = bonus;
    }

    var sandiness_by_id = {};
    function getSandinessById(id) {
        if (sandiness_by_id.hasOwnProperty(id)) {
            return sandiness_by_id[id];
        } else {
            return 0;
        }
    }
    function giveSandiness(id, sandiness) {
        sandiness += getSandinessById(id);
        sandiness_by_id[id] = sandiness;
    }
    setInterval(function () {
        for (var i in sandiness_by_id) {
            if (sandiness_by_id.hasOwnProperty(i)) {
                sandiness_by_id[i] = Math.max(sandiness_by_id[i] - 1, 0);
            }
        }
    }, 24 * 60 * 60000);

    setInterval(function () {
        db.put("look.outside.◍Sand", "We don't talk about that.");
    }, 6000);

    var FISHING_CHANCE = 0.02;
    setInterval(function () {
        var results = [];
        db.createReadStream({
            start: "fishing~",
            end: "fishing~\xff"
        })
            .on("data", function (data) {
                if (data.value) results.push(data.key);
            })
            .on("end", function () {
                if (results.length === 0) return;
                if (Math.random() > FISHING_CHANCE * results.length) return;
                var winner =
                    results[Math.floor(Math.random() * results.length)];
                if (winner.match(/^fishing~[0-9a-f]{24}$/)) {
                    db.del(winner);
                    var user_id = winner.substr(-24);
                    var part;
                    for (var i in client.ppl) {
                        if (client.ppl[i]._id === user_id) {
                            part = client.ppl[i];
                            break;
                        }
                    }
                    if (part) {
                        catchSomething(part);
                    }
                }
            });
    }, 5000);

    setInterval(function () {
        return; // stop auto-fishing

        if (!client.isConnected()) return;

        var part = client.ppl[client.participantId];
        if (!part) return;

        var key = "fishing~" + part._id;
        db.get(key, function (err, value) {
            if (!value) {
                sendChat("/fish");
            } else {
                db.getFish(part._id, function (myfish) {
                    if (!myfish.length) return;
                    var rand = Math.floor(
                        Math.random() * client.countParticipants()
                    );
                    var dest;
                    for (var i in client.ppl) {
                        if (!client.ppl.hasOwnProperty(i)) continue;
                        if (i == rand) break;
                        else dest = client.ppl[i];
                    }
                    if (dest && dest.id !== client.participantId) {
                        sendChat("/give " + dest.name.split(" ")[0]);
                    }
                });
                /*if(findParticipantByNameFuzzy("potato")) {
					var asdf = findParticipantByNameFuzzy("electrashave") || findParticipantByNameFuzzy("potato") || findParticipantByNameFuzzy("totoro");
					if(asdf) sendChat("/duel "+asdf.name);
				}*/
            }

            /*else */
        });
    }, 120000);

    function setTerminalTitle(title) {
        process.stdout.write(
            String.fromCharCode(27) + "]0;" + title + String.fromCharCode(7)
        );
    }

    client.on("count", function (count) {
        if (count > 0) {
            setTerminalTitle("fishing (" + count + ")");
        } else {
            setTerminalTitle("fishing");
        }
    });
    //sendChat("/fish");

    //var pong = new Pong(client, db);
    //setInterval(function() {
    //	pong.tick();
    //}, 100);

    // job
    /*sendChat("/job");
	client.on("a", function(msg) {
		if(msg.a.indexOf("Fishing returns from job") > -1) {
			sendChat("/job");
		}
	});
	setInterval(function() {
		sendChat("/job");
	}, 60000);*/
}

var Pong = function (client, db) {
    this.client = client;
    this.db = db;
    this.vx = 1.5;
    this.vy = 2.2;
    var self = this;
    self.part = self.client.ppl[self.client.participantId];
    client.on("ch", function () {
        self.part = self.client.ppl[self.client.participantId];
    });
    this.player1 = undefined;
    this.player2 = undefined;
};

Pong.prototype.tick = function () {
    if (!this.client.isConnected() || !this.part) return;
    this.part.x += this.vx;
    this.part.y += this.vy;
    if (this.part.x < 0) {
        this.vx = -this.vx;
    } else if (this.part.x > 100) {
        this.vx = -this.vx;
    }
    if (this.part.y < 0) {
        this.vy = -this.vy;
    } else if (this.part.y > 100) {
        this.vy = -this.vy;
    }
    //this.vx += Math.random() * 0.5 - 0.25;
    //this.vy += Math.random() * 0.5 - 0.25;
    this.client.sendArray([{ m: "m", x: this.part.x, y: this.part.y }]);
};

var Exchange = function (db) {
    this.db = db;
};

Exchange.prototype.takePokemon = function (user_id, amount) {
    var self = this;
    self.db.getPokemon(user_id, function (pok) {
        self.db.getPokemon("exchange", function (pok2) {
            for (var i = 0; i < amount; i++) pok2.push(pok.shift());
            self.db.putPokemon(user_id, pok);
            self.db.putPokemon("exchange", pok2);
        });
    });
};

Exchange.prototype.takeFish = function (user_id, amount) {
    var self = this;
    self.db.getFish(user_id, function (fish) {
        self.db.getFish("exchange", function (fish2) {
            for (var i = 0; i < amount; i++) fish2.push(fish.shift());
            self.db.putFish(user_id, fish);
            self.db.putFish("exchange", fish2);
        });
    });
};

Exchange.prototype.givePokemon = function (user_id, amount) {
    var self = this;
    self.db.getPokemon(user_id, function (pok) {
        self.db.getPokemon("exchange", function (pok2) {
            for (var i = 0; i < amount; i++) pok.push(pok2.shift());
            self.db.putPokemon(user_id, pok);
            self.db.putPokemon("exchange", pok2);
        });
    });
};

Exchange.prototype.giveFish = function (user_id, amount) {
    var self = this;
    self.db.getFish(user_id, function (fish) {
        self.db.getFish("exchange", function (fish2) {
            for (var i = 0; i < amount; i++) fish.push(fish2.shift());
            self.db.putFish(user_id, fish);
            self.db.putFish("exchange", fish2);
        });
    });
};

Exchange.prototype.placeAskOrder = function (user_id, amount, price) {
    this.takePokemon(user_id, amount);
    this.db.put(
        "exchange ask~" +
            Exchange.intToKey(price) +
            "~" +
            Exchange.intToKey(Date.now()) +
            "~" +
            user_id,
        amount.toString()
    );
};

Exchange.prototype.placeBidOrder = function (user_id, amount, price) {
    this.takeFish(user_id, price * amount);
    this.db.put(
        "exchange bid~" +
            Exchange.intToKey(price) +
            "~" +
            Exchange.intToKey(-Date.now()) +
            "~" +
            user_id,
        amount.toString()
    );
};

Exchange.prototype.fillAsks = function (user_id, amount, price, market) {
    var self = this;
    self.db
        .createReadStream({
            start: "exchange ask~" + Exchange.intToKey(price) + "~",
            end: "exchange ask~~"
        })
        .on("data", function (data) {
            if (amount < 1) return;
            var tprice = parseInt(data.key.match(/^exchange ask~(.*)~/)[1], 36);
            if (!market && tprice > price) return;
            var value = parseInt(data.value || 0) || 0;
            var tamt = 0;
            if (value > amount) {
                tamt = amount;
                self.db.put(data.key, (value - tamt).toString());
            } else {
                tamt = value;
                self.db.del(data.key);
            }
            amount -= tamt;
            self.db.put("exchange data~last", tprice);

            var other_user_id = data.key.match(/[0-9a-f]{24}/i)[0];
            self.takeFish(user_id, price * tamt);
            self.takePokemon(other_user_id, tamt);
            setTimeout(function () {
                self.giveFish(other_user_id, tprice * tamt);
                self.givePokemon(user_id, tamt);
            }, 200);
        })
        .on("end", function () {
            if (amount) {
                self.placeBidOrder(user_id, amount, price);
            }
        });
};

Exchange.prototype.fillBids = function (user_id, amount, price, market) {
    var self = this;
    self.db
        .createReadStream({
            start: "exchange bid~~",
            end: "exchange bid~" + Exchange.intToKey(price) + "~",
            reverse: true
        })
        .on("data", function (data) {
            if (amount < 1) return;
            var tprice = parseInt(data.key.match(/^exchange bid~(.*)~/)[1], 36);
            if (!market && tprice < price) return;
            var value = parseInt(data.value || 0) || 0;
            var tamt = 0;
            if (value > amount) {
                tamt = amount;
                self.db.put(data.key, (value - tamt).toString());
            } else {
                tamt = value;
                self.db.del(data.key);
            }
            amount -= tamt;
            self.db.put("exchange data~last", tprice);

            var other_user_id = data.key.match(/[0-9a-f]{24}/i)[0];
            self.takePokemon(user_id, tamt);
            self.takeFish(other_user_id, tprice * tamt);
            setTimeout(function () {
                self.givePokemon(other_user_id, tamt);
                self.giveFish(user_id, tprice * tamt);
            }, 200);
        })
        .on("end", function () {
            if (amount) {
                self.placeAskOrder(user_id, amount, market ? 1 : price);
            }
        });
};

Exchange.prototype.buy = function (user_id, amount, price) {
    if (typeof price === "number") {
        this.fillAsks(user_id, amount, price, false);
    } else {
        this.fillAsks(user_id, amount, 1, true);
    }
};

Exchange.prototype.sell = function (user_id, amount, price) {
    if (typeof price === "number") {
        this.fillBids(user_id, amount, price, false);
    } else {
        this.fillBids(user_id, amount, 1000000, true);
    }
};

Exchange.prototype.getCanSell = function (user_id, amount, price, cb) {
    if (amount < 1) cb(false);
    else if (price === 0) cb(false);
    else if (!Exchange.validateInt(amount)) cb(false);
    else if (typeof price === "number" && !Exchange.validateInt(price))
        cb(false);
    else
        this.db.getPokemon(user_id, function (pok) {
            if (pok.length < amount) cb(false);
            else cb(true);
        });
};

Exchange.prototype.getCanBuy = function (user_id, amount, price, cb) {
    if (amount < 1) cb(false);
    else if (price === 0) cb(false);
    else if (!Exchange.validateInt(amount)) cb(false);
    else if (typeof price === "number" && !Exchange.validateInt(price))
        cb(false);
    else
        this.db.getFish(user_id, function (fish) {
            if (fish.length < amount * price) cb(false);
            else cb(true);
        });
};

Exchange.prototype.getOrderBook = function (type, id, cb) {
    var orders = [];
    this.db
        .createReadStream({
            start: "exchange " + type + "~",
            end: "exchange " + type + "~~"
        })
        .on("data", function (data) {
            if (id && !data.key.match(new RegExp(id + "$"))) return;
            var amount = parseInt(data.value || 0) || 0;
            var price = parseInt(
                data.key.match(new RegExp("^exchange " + type + "~(.*)~"))[1],
                36
            );
            orders.push(amount + "@" + price);
        })
        .on("end", function () {
            cb(orders);
        });
};

Exchange.prototype.cancel = function (id, type, amount, price, cb) {
    var self = this;
    var orders = [];
    this.db
        .createReadStream({
            start: "exchange " + type + "~",
            end: "exchange " + type + "~~"
        })
        .on("data", function (data) {
            if (!data.key.match(new RegExp(id + "$"))) return;
            var a = parseInt(data.value || 0) || 0;
            var p = parseInt(
                data.key.match(new RegExp("^exchange " + type + "~(.*)~"))[1],
                36
            );
            if (a == amount && p == price) {
                orders.push(a + "@" + p);
                // delete order
                self.db.del(data.key);
                // return items
                if (type === "ask") {
                    self.givePokemon(id, amount);
                } else if (type === "bid") {
                    self.giveFish(id, price * amount);
                }
            }
        })
        .on("end", function () {
            if (cb) cb(orders);
        });
};

Exchange.validateInt = function (int) {
    if (Math.floor(int) !== int) return false;
    int = int.toString(36);
    if (int.length > 50) return false;
    return true;
};

Exchange.intToKey = function (int) {
    if (!Exchange.validateInt(int)) {
        console.trace("Invalid int " + int);
        return;
    }
    var negative = int < 0;
    int = int.toString(36);
    if (negative) int = int.substr(1);
    while (int.length < 50) int = (negative ? "\xff" : "0") + int;
    return int;
};

var Color = function () {
    var r, g, b;
    if (arguments.length === 1) {
        var hexa = arguments[0].toLowerCase();
        if (hexa.match(/^#[0-9a-f]{6}$/i)) {
            hexa = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hexa);
            if (hexa && hexa.length === 4) {
                r = parseInt(hexa[1], 16);
                g = parseInt(hexa[2], 16);
                b = parseInt(hexa[3], 16);
            }
        }
    } else if (arguments.length === 3) {
        r = arguments[0];
        g = arguments[1];
        b = arguments[2];
    }
    this.r = ~~r || 0;
    this.g = ~~g || 0;
    this.b = ~~b || 0;
};

Color.prototype.distance = function (color) {
    var d = 0;
    d += Math.pow(this.r - color.r, 2);
    d += Math.pow(this.g - color.g, 2);
    d += Math.pow(this.b - color.b, 2);
    return Math.abs(Math.sqrt(d));
};

Color.prototype.toHexa = function () {
    var r = this.r.toString(16),
        g = this.g.toString(16),
        b = this.b.toString(16);
    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;
    return "#" + r + g + b;
};

Color.prototype.getName = function () {
    var hexa = this.toHexa();
    var low = 256;
    var name;
    for (var n in Color.map) {
        if (!Color.map.hasOwnProperty(n)) continue;
        var color = Color.map[n];
        if (color.r === this.r && color.g === this.g && color.b === this.b) {
            return n;
        }
        var dist = this.distance(color);
        if (dist < low) {
            low = dist;
            name = n;
        }
    }
    if (!name) name = this.toHexa();
    else name = "A shade of " + name;
    return name;
};

Color.map = {};

Color.addToMap = function (hexa, name) {
    Color.map[name] = new Color(hexa);
};

Color.addToMap("#7CB9E8", "Aero");
Color.addToMap("#C9FFE5", "Aero blue");
Color.addToMap("#B284BE", "African purple");
Color.addToMap("#5D8AA8", "Air Force blue (RAF)");
Color.addToMap("#00308F", "Air Force blue (USAF)");
Color.addToMap("#72A0C1", "Air superiority blue");
Color.addToMap("#AF002A", "Alabama Crimson");
Color.addToMap("#F0F8FF", "Alice blue");
Color.addToMap("#E32636", "Alizarin crimson");
Color.addToMap("#C46210", "Alloy orange");
Color.addToMap("#EFDECD", "Almond");
Color.addToMap("#E52B50", "Amaranth");
Color.addToMap("#F19CBB", "Amaranth pink");
Color.addToMap("#AB274F", "Dark amaranth");
Color.addToMap("#3B7A57", "Amazon");
Color.addToMap("#FF7E00", "Amber");
Color.addToMap("#FF033E", "American rose");
Color.addToMap("#9966CC", "Amethyst");
Color.addToMap("#A4C639", "Android green");
Color.addToMap("#F2F3F4", "Anti-flash white");
Color.addToMap("#CD9575", "Antique brass");
Color.addToMap("#665D1E", "Antique bronze");
Color.addToMap("#915C83", "Antique fuchsia");
Color.addToMap("#841B2D", "Antique ruby");
Color.addToMap("#FAEBD7", "Antique white");
Color.addToMap("#8DB600", "Apple green");
Color.addToMap("#FBCEB1", "Apricot");
Color.addToMap("#00FFFF", "Aqua");
Color.addToMap("#7FFFD4", "Aquamarine");
Color.addToMap("#4B5320", "Army green");
Color.addToMap("#3B444B", "Arsenic");
Color.addToMap("#8F9779", "Artichoke");
Color.addToMap("#B2BEB5", "Ash grey");
Color.addToMap("#87A96B", "Asparagus");
Color.addToMap("#FDEE00", "Aureolin");
Color.addToMap("#6E7F80", "AuroMetalSaurus");
Color.addToMap("#568203", "Avocado");
Color.addToMap("#007FFF", "Azure");
Color.addToMap("#F0FFFF", "Azure mist/web");
Color.addToMap("#89CFF0", "Baby blue");
Color.addToMap("#A1CAF1", "Baby blue eyes");
Color.addToMap("#FEFEFA", "Baby powder");
Color.addToMap("#FF91AF", "Baker-Miller pink");
Color.addToMap("#21ABCD", "Ball blue");
Color.addToMap("#FAE7B5", "Banana Mania");
Color.addToMap("#FFE135", "Banana yellow");
Color.addToMap("#E0218A", "Barbie pink");
Color.addToMap("#7C0A02", "Barn red");
Color.addToMap("#848482", "Battleship grey");
Color.addToMap("#98777B", "Bazaar");
Color.addToMap("#9F8170", "Beaver");
Color.addToMap("#F5F5DC", "Beige");
Color.addToMap("#2E5894", "B'dazzled blue");
Color.addToMap("#9C2542", "Big dip o’ruby");
Color.addToMap("#FFE4C4", "Bisque");
Color.addToMap("#3D2B1F", "Bistre");
Color.addToMap("#967117", "Bistre brown");
Color.addToMap("#CAE00D", "Bitter lemon");
Color.addToMap("#648C11", "Bitter lime");
Color.addToMap("#FE6F5E", "Bittersweet");
Color.addToMap("#BF4F51", "Bittersweet shimmer");
Color.addToMap("#000000", "Black");
Color.addToMap("#3D0C02", "Black bean");
Color.addToMap("#253529", "Black leather jacket");
Color.addToMap("#3B3C36", "Black olive");
Color.addToMap("#FFEBCD", "Blanched almond");
Color.addToMap("#A57164", "Blast-off bronze");
Color.addToMap("#318CE7", "Bleu de France");
Color.addToMap("#ACE5EE", "Blizzard Blue");
Color.addToMap("#FAF0BE", "Blond");
Color.addToMap("#0000FF", "Blue");
Color.addToMap("#1F75FE", "Blue (Crayola)");
Color.addToMap("#0093AF", "Blue (Munsell)");
Color.addToMap("#0087BD", "Blue (NCS)");
Color.addToMap("#333399", "Blue (pigment)");
Color.addToMap("#0247FE", "Blue (RYB)");
Color.addToMap("#A2A2D0", "Blue Bell");
Color.addToMap("#6699CC", "Blue-gray");
Color.addToMap("#0D98BA", "Blue-green");
Color.addToMap("#126180", "Blue sapphire");
Color.addToMap("#8A2BE2", "Blue-violet");
Color.addToMap("#5072A7", "Blue yonder");
Color.addToMap("#4F86F7", "Blueberry");
Color.addToMap("#1C1CF0", "Bluebonnet");
Color.addToMap("#DE5D83", "Blush");
Color.addToMap("#79443B", "Bole Brown");
Color.addToMap("#0095B6", "Bondi blue");
Color.addToMap("#E3DAC9", "Bone");
Color.addToMap("#CC0000", "Boston University Red");
Color.addToMap("#006A4E", "Bottle green");
Color.addToMap("#873260", "Boysenberry");
Color.addToMap("#0070FF", "Brandeis blue");
Color.addToMap("#B5A642", "Brass");
Color.addToMap("#CB4154", "Brick red");
Color.addToMap("#1DACD6", "Bright cerulean");
Color.addToMap("#66FF00", "Bright green");
Color.addToMap("#BF94E4", "Bright lavender");
Color.addToMap("#D891EF", "Bright lilac");
Color.addToMap("#C32148", "Bright maroon");
Color.addToMap("#1974D2", "Bright navy blue");
Color.addToMap("#FF007F", "Bright pink");
Color.addToMap("#08E8DE", "Bright turquoise");
Color.addToMap("#D19FE8", "Bright ube");
Color.addToMap("#F4BBFF", "Brilliant lavender");
Color.addToMap("#FF55A3", "Brilliant rose");
Color.addToMap("#FB607F", "Brink pink");
Color.addToMap("#004225", "British racing green");
Color.addToMap("#CD7F32", "Bronze");
Color.addToMap("#737000", "Bronze Yellow");
Color.addToMap("#964B00", "Brown");
Color.addToMap("#6B4423", "Brown-nose");
Color.addToMap("#FFC1CC", "Bubble gum");
Color.addToMap("#E7FEFF", "Bubbles");
Color.addToMap("#F0DC82", "Buff");
Color.addToMap("#7BB661", "Bud green");
Color.addToMap("#480607", "Bulgarian rose");
Color.addToMap("#800020", "Burgundy");
Color.addToMap("#DEB887", "Burlywood");
Color.addToMap("#CC5500", "Burnt orange");
Color.addToMap("#8A3324", "Burnt umber");
Color.addToMap("#BD33A4", "Byzantine");
Color.addToMap("#702963", "Byzantium");
Color.addToMap("#536872", "Cadet");
Color.addToMap("#5F9EA0", "Cadet blue");
Color.addToMap("#91A3B0", "Cadet grey");
Color.addToMap("#006B3C", "Cadmium green");
Color.addToMap("#ED872D", "Cadmium orange");
Color.addToMap("#E30022", "Cadmium red");
Color.addToMap("#FFF600", "Cadmium yellow");
Color.addToMap("#A67B5B", "Cafe au lait");
Color.addToMap("#4B3621", "Cafe noir");
Color.addToMap("#1E4D2B", "Cal Poly green");
Color.addToMap("#A3C1AD", "Cambridge Blue");
Color.addToMap("#EFBBCC", "Cameo pink");
Color.addToMap("#78866B", "Camouflage green");
Color.addToMap("#FFEF00", "Canary yellow");
Color.addToMap("#FF0800", "Candy apple red");
Color.addToMap("#E4717A", "Candy pink");
Color.addToMap("#592720", "Caput mortuum");
Color.addToMap("#C41E3A", "Cardinal");
Color.addToMap("#00CC99", "Caribbean green");
Color.addToMap("#960018", "Carmine");
Color.addToMap("#EB4C42", "Carmine pink");
Color.addToMap("#FF0038", "Carmine red");
Color.addToMap("#FFA6C9", "Carnation pink");
Color.addToMap("#99BADD", "Carolina blue");
Color.addToMap("#ED9121", "Carrot orange");
Color.addToMap("#00563F", "Castleton green");
Color.addToMap("#062A78", "Catalina blue");
Color.addToMap("#703642", "Catawba");
Color.addToMap("#C95A49", "Cedar Chest");
Color.addToMap("#92A1CF", "Ceil");
Color.addToMap("#ACE1AF", "Celadon");
Color.addToMap("#007BA7", "Celadon blue");
Color.addToMap("#2F847C", "Celadon green");
Color.addToMap("#4997D0", "Celestial blue");
Color.addToMap("#EC3B83", "Cerise pink");
Color.addToMap("#2A52BE", "Cerulean blue");
Color.addToMap("#6D9BC3", "Cerulean frost");
Color.addToMap("#007AA5", "CG Blue");
Color.addToMap("#E03C31", "CG Red");
Color.addToMap("#A0785A", "Chamoisee");
Color.addToMap("#F7E7CE", "Champagne");
Color.addToMap("#36454F", "Charcoal");
Color.addToMap("#232B2B", "Charleston green");
Color.addToMap("#E68FAC", "Charm pink");
Color.addToMap("#DFFF00", "Chartreuse");
Color.addToMap("#7FFF00", "Chartreuse (web)");
Color.addToMap("#DE3163", "Cherry");
Color.addToMap("#FFB7C5", "Cherry blossom pink");
Color.addToMap("#954535", "Chestnut");
Color.addToMap("#A8516E", "China rose");
Color.addToMap("#AA381E", "Chinese red");
Color.addToMap("#856088", "Chinese violet");
Color.addToMap("#7B3F00", "Chocolate");
Color.addToMap("#FFA700", "Chrome yellow");
Color.addToMap("#98817B", "Cinereous");
Color.addToMap("#E4D00A", "Citrine");
Color.addToMap("#9FA91F", "Citron");
Color.addToMap("#7F1734", "Claret");
Color.addToMap("#FBCCE7", "Classic rose");
Color.addToMap("#0047AB", "Cobalt");
Color.addToMap("#D2691E", "Cocoa brown");
Color.addToMap("#965A3E", "Coconut");
Color.addToMap("#6F4E37", "Coffee Brown");
Color.addToMap("#9BDDFF", "Columbia blue");
Color.addToMap("#002E63", "Cool black");
Color.addToMap("#8C92AC", "Cool grey");
Color.addToMap("#B87333", "Copper");
Color.addToMap("#AD6F69", "Copper penny");
Color.addToMap("#CB6D51", "Copper red");
Color.addToMap("#996666", "Copper rose");
Color.addToMap("#FF3800", "Coquelicot");
Color.addToMap("#FF7F50", "Coral");
Color.addToMap("#F88379", "Coral pink");
Color.addToMap("#FF4040", "Coral red");
Color.addToMap("#893F45", "Cordovan");
Color.addToMap("#FBEC5D", "Corn Yellow");
Color.addToMap("#B31B1B", "Cornell Red");
Color.addToMap("#6495ED", "Cornflower blue");
Color.addToMap("#FFF8DC", "Cornsilk");
Color.addToMap("#FFF8E7", "Cosmic latte");
Color.addToMap("#FFBCD9", "Cotton candy");
Color.addToMap("#FFFDD0", "Cream");
Color.addToMap("#DC143C", "Crimson");
Color.addToMap("#BE0032", "Crimson glory");
Color.addToMap("#00B7EB", "Cyan");
Color.addToMap("#58427C", "Cyber grape");
Color.addToMap("#FFD300", "Cyber yellow");
Color.addToMap("#FFFF31", "Daffodil");
Color.addToMap("#F0E130", "Dandelion");
Color.addToMap("#00008B", "Dark blue");
Color.addToMap("#666699", "Dark blue-gray");
Color.addToMap("#654321", "Dark brown");
Color.addToMap("#5D3954", "Dark byzantium");
Color.addToMap("#A40000", "Dark candy apple red");
Color.addToMap("#08457E", "Dark cerulean");
Color.addToMap("#986960", "Dark chestnut");
Color.addToMap("#CD5B45", "Dark coral");
Color.addToMap("#008B8B", "Dark cyan");
Color.addToMap("#536878", "Dark electric blue");
Color.addToMap("#B8860B", "Dark goldenrod");
Color.addToMap("#A9A9A9", "Dark gray");
Color.addToMap("#013220", "Dark green");
Color.addToMap("#00416A", "Dark imperial blue");
Color.addToMap("#1A2421", "Dark jungle green");
Color.addToMap("#BDB76B", "Dark khaki");
Color.addToMap("#734F96", "Dark lavender");
Color.addToMap("#534B4F", "Dark liver");
Color.addToMap("#543D37", "Dark liver (horses)");
Color.addToMap("#8B008B", "Dark magenta");
Color.addToMap("#003366", "Dark midnight blue");
Color.addToMap("#4A5D23", "Dark moss green");
Color.addToMap("#556B2F", "Dark olive green");
Color.addToMap("#FF8C00", "Dark orange");
Color.addToMap("#9932CC", "Dark orchid");
Color.addToMap("#779ECB", "Dark pastel blue");
Color.addToMap("#03C03C", "Dark pastel green");
Color.addToMap("#966FD6", "Dark pastel purple");
Color.addToMap("#C23B22", "Dark pastel red");
Color.addToMap("#E75480", "Dark pink");
Color.addToMap("#003399", "Dark powder blue");
Color.addToMap("#4F3A3C", "Dark puce");
Color.addToMap("#872657", "Dark raspberry");
Color.addToMap("#8B0000", "Dark red");
Color.addToMap("#E9967A", "Dark salmon");
Color.addToMap("#560319", "Dark scarlet");
Color.addToMap("#8FBC8F", "Dark sea green");
Color.addToMap("#3C1414", "Dark sienna");
Color.addToMap("#8CBED6", "Dark sky blue");
Color.addToMap("#483D8B", "Dark slate blue");
Color.addToMap("#2F4F4F", "Dark slate gray");
Color.addToMap("#177245", "Dark spring green");
Color.addToMap("#918151", "Dark tan");
Color.addToMap("#FFA812", "Dark tangerine");
Color.addToMap("#CC4E5C", "Dark terra cotta");
Color.addToMap("#00CED1", "Dark turquoise");
Color.addToMap("#D1BEA8", "Dark vanilla");
Color.addToMap("#9400D3", "Dark violet");
Color.addToMap("#9B870C", "Dark yellow");
Color.addToMap("#00703C", "Dartmouth green");
Color.addToMap("#555555", "Davy's grey");
Color.addToMap("#D70A53", "Debian red");
Color.addToMap("#A9203E", "Deep carmine");
Color.addToMap("#EF3038", "Deep carmine pink");
Color.addToMap("#E9692C", "Deep carrot orange");
Color.addToMap("#DA3287", "Deep cerise");
Color.addToMap("#B94E48", "Deep chestnut");
Color.addToMap("#C154C1", "Deep fuchsia");
Color.addToMap("#004B49", "Deep jungle green");
Color.addToMap("#F5C71A", "Deep lemon");
Color.addToMap("#9955BB", "Deep lilac");
Color.addToMap("#CC00CC", "Deep magenta");
Color.addToMap("#D473D4", "Deep mauve");
Color.addToMap("#355E3B", "Deep moss green");
Color.addToMap("#FFCBA4", "Deep peach");
Color.addToMap("#A95C68", "Deep puce");
Color.addToMap("#843F5B", "Deep ruby");
Color.addToMap("#FF9933", "Deep saffron");
Color.addToMap("#00BFFF", "Deep sky blue");
Color.addToMap("#4A646C", "Deep Space Sparkle");
Color.addToMap("#7E5E60", "Deep Taupe");
Color.addToMap("#66424D", "Deep Tuscan red");
Color.addToMap("#BA8759", "Deer");
Color.addToMap("#1560BD", "Denim");
Color.addToMap("#EDC9AF", "Desert sand");
Color.addToMap("#EA3C53", "Desire");
Color.addToMap("#B9F2FF", "Diamond");
Color.addToMap("#696969", "Dim gray");
Color.addToMap("#9B7653", "Dirt");
Color.addToMap("#1E90FF", "Dodger blue");
Color.addToMap("#D71868", "Dogwood rose");
Color.addToMap("#85BB65", "Dollar bill");
Color.addToMap("#664C28", "Donkey Brown");
Color.addToMap("#00009C", "Duke blue");
Color.addToMap("#E5CCC9", "Dust storm");
Color.addToMap("#EFDFBB", "Dutch white");
Color.addToMap("#E1A95F", "Earth yellow");
Color.addToMap("#555D50", "Ebony");
Color.addToMap("#1B1B1B", "Eerie black");
Color.addToMap("#614051", "Eggplant");
Color.addToMap("#F0EAD6", "Eggshell");
Color.addToMap("#1034A6", "Egyptian blue");
Color.addToMap("#7DF9FF", "Electric blue");
Color.addToMap("#FF003F", "Electric crimson");
Color.addToMap("#00FF00", "Electric green");
Color.addToMap("#6F00FF", "Electric indigo");
Color.addToMap("#CCFF00", "Electric lime");
Color.addToMap("#BF00FF", "Electric purple");
Color.addToMap("#3F00FF", "Electric ultramarine");
Color.addToMap("#FFFF00", "Electric yellow");
Color.addToMap("#50C878", "Emerald");
Color.addToMap("#6C3082", "Eminence");
Color.addToMap("#1B4D3E", "English green");
Color.addToMap("#B48395", "English lavender");
Color.addToMap("#AB4B52", "English red");
Color.addToMap("#563C5C", "English violet");
Color.addToMap("#96C8A2", "Eton blue");
Color.addToMap("#44D7A8", "Eucalyptus");
Color.addToMap("#801818", "Falu red");
Color.addToMap("#B53389", "Fandango");
Color.addToMap("#DE5285", "Fandango pink");
Color.addToMap("#F400A1", "Fashion fuchsia");
Color.addToMap("#E5AA70", "Fawn");
Color.addToMap("#4D5D53", "Feldgrau");
Color.addToMap("#4F7942", "Fern green");
Color.addToMap("#FF2800", "Ferrari Red");
Color.addToMap("#6C541E", "Field drab");
Color.addToMap("#B22222", "Firebrick");
Color.addToMap("#CE2029", "Fire engine red");
Color.addToMap("#E25822", "Flame");
Color.addToMap("#FC8EAC", "Flamingo pink");
Color.addToMap("#F7E98E", "Flavescent");
Color.addToMap("#EEDC82", "Flax");
Color.addToMap("#A2006D", "Flirt");
Color.addToMap("#FFFAF0", "Floral white");
Color.addToMap("#FFBF00", "Fluorescent orange");
Color.addToMap("#FF1493", "Fluorescent pink");
Color.addToMap("#FF004F", "Folly");
Color.addToMap("#014421", "Forest green");
Color.addToMap("#228B22", "Forest green (web)");
Color.addToMap("#856D4D", "French bistre");
Color.addToMap("#0072BB", "French blue");
Color.addToMap("#FD3F92", "French fuchsia");
Color.addToMap("#86608E", "French lilac");
Color.addToMap("#9EFD38", "French lime");
Color.addToMap("#FD6C9E", "French pink");
Color.addToMap("#4E1609", "French puce");
Color.addToMap("#C72C48", "French raspberry");
Color.addToMap("#F64A8A", "French rose");
Color.addToMap("#77B5FE", "French sky blue");
Color.addToMap("#8806CE", "French violet");
Color.addToMap("#AC1E44", "French wine");
Color.addToMap("#A6E7FF", "Fresh Air");
Color.addToMap("#FF77FF", "Fuchsia pink");
Color.addToMap("#CC397B", "Fuchsia purple");
Color.addToMap("#C74375", "Fuchsia rose");
Color.addToMap("#E48400", "Fulvous");
Color.addToMap("#CC6666", "Fuzzy Wuzzy");
Color.addToMap("#DCDCDC", "Gainsboro");
Color.addToMap("#E49B0F", "Gamboge");
Color.addToMap("#007F66", "Generic viridian");
Color.addToMap("#F8F8FF", "Ghost white");
Color.addToMap("#FE5A1D", "Giants orange");
Color.addToMap("#B06500", "Ginger");
Color.addToMap("#6082B6", "Glaucous");
Color.addToMap("#E6E8FA", "Glitter");
Color.addToMap("#00AB66", "GO green");
Color.addToMap("#D4AF37", "Gold (metallic)");
Color.addToMap("#FFD700", "Gold (web) (Golden)");
Color.addToMap("#85754E", "Gold Fusion");
Color.addToMap("#996515", "Golden brown");
Color.addToMap("#FCC200", "Golden poppy");
Color.addToMap("#FFDF00", "Golden yellow");
Color.addToMap("#DAA520", "Goldenrod");
Color.addToMap("#A8E4A0", "Granny Smith Apple");
Color.addToMap("#6F2DA8", "Grape");
Color.addToMap("#808080", "Gray");
Color.addToMap("#BEBEBE", "Gray (X11 gray)");
Color.addToMap("#465945", "Gray-asparagus");
Color.addToMap("#1CAC78", "Green (Crayola)");
Color.addToMap("#008000", "Green");
Color.addToMap("#00A877", "Green (Munsell)");
Color.addToMap("#009F6B", "Green (NCS)");
Color.addToMap("#00A550", "Green (pigment)");
Color.addToMap("#66B032", "Green (RYB)");
Color.addToMap("#ADFF2F", "Green-yellow");
Color.addToMap("#A99A86", "Grullo");
Color.addToMap("#663854", "Halaya ube");
Color.addToMap("#446CCF", "Han blue");
Color.addToMap("#5218FA", "Han purple");
Color.addToMap("#E9D66B", "Hansa yellow");
Color.addToMap("#3FFF00", "Harlequin");
Color.addToMap("#C90016", "Harvard crimson");
Color.addToMap("#DA9100", "Harvest gold");
Color.addToMap("#DF73FF", "Heliotrope");
Color.addToMap("#AA98A9", "Heliotrope gray");
Color.addToMap("#F0FFF0", "Honeydew");
Color.addToMap("#006DB0", "Honolulu blue");
Color.addToMap("#49796B", "Hooker's green");
Color.addToMap("#FF1DCE", "Hot magenta");
Color.addToMap("#FF69B4", "Hot pink");
Color.addToMap("#71A6D2", "Iceberg");
Color.addToMap("#FCF75E", "Icterine");
Color.addToMap("#319177", "Illuminating Emerald");
Color.addToMap("#602F6B", "Imperial");
Color.addToMap("#002395", "Imperial blue");
Color.addToMap("#66023C", "Imperial purple");
Color.addToMap("#ED2939", "Imperial red");
Color.addToMap("#B2EC5D", "Inchworm");
Color.addToMap("#4C516D", "Independence");
Color.addToMap("#138808", "India green");
Color.addToMap("#CD5C5C", "Indian red");
Color.addToMap("#E3A857", "Indian yellow");
Color.addToMap("#4B0082", "Indigo");
Color.addToMap("#002FA7", "International Klein Blue");
Color.addToMap("#FF4F00", "International orange (aerospace)");
Color.addToMap("#BA160C", "International orange (engineering)");
Color.addToMap("#C0362C", "International orange (Golden Gate Bridge)");
Color.addToMap("#5A4FCF", "Iris");
Color.addToMap("#F4F0EC", "Isabelline");
Color.addToMap("#009000", "Islamic green");
Color.addToMap("#B2FFFF", "Italian sky blue");
Color.addToMap("#FFFFF0", "Ivory");
Color.addToMap("#00A86B", "Jade");
Color.addToMap("#9D2933", "Japanese carmine");
Color.addToMap("#264348", "Japanese indigo");
Color.addToMap("#5B3256", "Japanese violet");
Color.addToMap("#D73B3E", "Jasper");
Color.addToMap("#A50B5E", "Jazzberry jam");
Color.addToMap("#DA614E", "Jelly Bean");
Color.addToMap("#343434", "Jet");
Color.addToMap("#F4CA16", "Jonquil");
Color.addToMap("#8AB9F1", "Jordy blue");
Color.addToMap("#BDDA57", "June bud");
Color.addToMap("#29AB87", "Jungle green");
Color.addToMap("#4CBB17", "Kelly green");
Color.addToMap("#7C1C05", "Kenyan copper");
Color.addToMap("#3AB09E", "Keppel");
Color.addToMap("#C3B091", "Khaki");
Color.addToMap("#E79FC4", "Kobi");
Color.addToMap("#354230", "Kombu green");
Color.addToMap("#E8000D", "KU Crimson");
Color.addToMap("#087830", "La Salle Green");
Color.addToMap("#D6CADD", "Languid lavender");
Color.addToMap("#26619C", "Lapis lazuli");
Color.addToMap("#A9BA9D", "Laurel green");
Color.addToMap("#CF1020", "Lava");
Color.addToMap("#B57EDC", "Lavender (floral)");
Color.addToMap("#CCCCFF", "Lavender blue");
Color.addToMap("#FFF0F5", "Lavender blush");
Color.addToMap("#C4C3D0", "Lavender gray");
Color.addToMap("#9457EB", "Lavender indigo");
Color.addToMap("#EE82EE", "Lavender magenta");
Color.addToMap("#E6E6FA", "Lavender mist");
Color.addToMap("#FBAED2", "Lavender pink");
Color.addToMap("#967BB6", "Lavender purple");
Color.addToMap("#FBA0E3", "Lavender rose");
Color.addToMap("#7CFC00", "Lawn green");
Color.addToMap("#FFF700", "Lemon");
Color.addToMap("#FFFACD", "Lemon chiffon");
Color.addToMap("#CCA01D", "Lemon curry");
Color.addToMap("#FDFF00", "Lemon glacier");
Color.addToMap("#E3FF00", "Lemon lime");
Color.addToMap("#F6EABE", "Lemon meringue");
Color.addToMap("#FFF44F", "Lemon yellow");
Color.addToMap("#1A1110", "Licorice");
Color.addToMap("#545AA7", "Liberty");
Color.addToMap("#FDD5B1", "Light apricot");
Color.addToMap("#ADD8E6", "Light blue");
Color.addToMap("#B5651D", "Light brown");
Color.addToMap("#E66771", "Light carmine pink");
Color.addToMap("#F08080", "Light coral");
Color.addToMap("#93CCEA", "Light cornflower blue");
Color.addToMap("#F56991", "Light crimson");
Color.addToMap("#E0FFFF", "Light cyan");
Color.addToMap("#FF5CCD", "Light deep pink");
Color.addToMap("#C8AD7F", "Light French beige");
Color.addToMap("#F984EF", "Light fuchsia pink");
Color.addToMap("#FAFAD2", "Light goldenrod yellow");
Color.addToMap("#D3D3D3", "Light gray");
Color.addToMap("#90EE90", "Light green");
Color.addToMap("#FFB3DE", "Light hot pink");
Color.addToMap("#F0E68C", "Light khaki");
Color.addToMap("#D39BCB", "Light medium orchid");
Color.addToMap("#ADDFAD", "Light moss green");
Color.addToMap("#E6A8D7", "Light orchid");
Color.addToMap("#B19CD9", "Light pastel purple");
Color.addToMap("#FFB6C1", "Light pink");
Color.addToMap("#E97451", "Light red ochre");
Color.addToMap("#FFA07A", "Light salmon");
Color.addToMap("#FF9999", "Light salmon pink");
Color.addToMap("#20B2AA", "Light sea green");
Color.addToMap("#87CEFA", "Light sky blue");
Color.addToMap("#778899", "Light slate gray");
Color.addToMap("#B0C4DE", "Light steel blue");
Color.addToMap("#B38B6D", "Light taupe");
Color.addToMap("#FFFFE0", "Light yellow");
Color.addToMap("#C8A2C8", "Lilac");
Color.addToMap("#BFFF00", "Lime");
Color.addToMap("#32CD32", "Lime green");
Color.addToMap("#9DC209", "Limerick");
Color.addToMap("#195905", "Lincoln green");
Color.addToMap("#FAF0E6", "Linen");
Color.addToMap("#6CA0DC", "Little boy blue");
Color.addToMap("#B86D29", "Liver (dogs)");
Color.addToMap("#6C2E1F", "Liver");
Color.addToMap("#987456", "Liver chestnut");
Color.addToMap("#FFE4CD", "Lumber");
Color.addToMap("#E62020", "Lust");
Color.addToMap("#FF00FF", "Magenta");
Color.addToMap("#CA1F7B", "Magenta (dye)");
Color.addToMap("#D0417E", "Magenta (Pantone)");
Color.addToMap("#FF0090", "Magenta (process)");
Color.addToMap("#9F4576", "Magenta haze");
Color.addToMap("#AAF0D1", "Magic mint");
Color.addToMap("#F8F4FF", "Magnolia");
Color.addToMap("#C04000", "Mahogany");
Color.addToMap("#6050DC", "Majorelle Blue");
Color.addToMap("#0BDA51", "Malachite");
Color.addToMap("#979AAA", "Manatee");
Color.addToMap("#FF8243", "Mango Tango");
Color.addToMap("#74C365", "Mantis");
Color.addToMap("#880085", "Mardi Gras");
Color.addToMap("#800000", "Maroon");
Color.addToMap("#E0B0FF", "Mauve");
Color.addToMap("#915F6D", "Mauve taupe");
Color.addToMap("#EF98AA", "Mauvelous");
Color.addToMap("#4C9141", "May green");
Color.addToMap("#73C2FB", "Maya blue");
Color.addToMap("#E5B73B", "Meat brown");
Color.addToMap("#66DDAA", "Medium aquamarine");
Color.addToMap("#0000CD", "Medium blue");
Color.addToMap("#E2062C", "Medium candy apple red");
Color.addToMap("#AF4035", "Medium carmine");
Color.addToMap("#035096", "Medium electric blue");
Color.addToMap("#1C352D", "Medium jungle green");
Color.addToMap("#BA55D3", "Medium orchid");
Color.addToMap("#9370DB", "Medium purple");
Color.addToMap("#BB3385", "Medium red-violet");
Color.addToMap("#AA4069", "Medium ruby");
Color.addToMap("#3CB371", "Medium sea green");
Color.addToMap("#80DAEB", "Medium sky blue");
Color.addToMap("#7B68EE", "Medium slate blue");
Color.addToMap("#C9DC87", "Medium spring bud");
Color.addToMap("#00FA9A", "Medium spring green");
Color.addToMap("#674C47", "Medium taupe");
Color.addToMap("#48D1CC", "Medium turquoise");
Color.addToMap("#D9603B", "Pale vermilion");
Color.addToMap("#F8B878", "Mellow apricot");
Color.addToMap("#F8DE7E", "Mellow yellow");
Color.addToMap("#FDBCB4", "Melon");
Color.addToMap("#0A7E8C", "Metallic Seaweed");
Color.addToMap("#9C7C38", "Metallic Sunburst");
Color.addToMap("#E4007C", "Mexican pink");
Color.addToMap("#191970", "Midnight blue");
Color.addToMap("#004953", "Midnight green (eagle green)");
Color.addToMap("#FFC40C", "Mikado yellow");
Color.addToMap("#E3F988", "Mindaro");
Color.addToMap("#3EB489", "Mint");
Color.addToMap("#F5FFFA", "Mint cream");
Color.addToMap("#98FF98", "Mint green");
Color.addToMap("#FFE4E1", "Misty rose");
Color.addToMap("#73A9C2", "Moonstone blue");
Color.addToMap("#AE0C00", "Mordant red 19");
Color.addToMap("#8A9A5B", "Moss green");
Color.addToMap("#30BA8F", "Mountain Meadow");
Color.addToMap("#997A8D", "Mountbatten pink");
Color.addToMap("#18453B", "MSU Green");
Color.addToMap("#306030", "Mughal green");
Color.addToMap("#C54B8C", "Mulberry");
Color.addToMap("#FFDB58", "Mustard");
Color.addToMap("#317873", "Myrtle green");
Color.addToMap("#F6ADC6", "Nadeshiko pink");
Color.addToMap("#2A8000", "Napier green");
Color.addToMap("#FFDEAD", "Navajo white");
Color.addToMap("#000080", "Navy");
Color.addToMap("#FFA343", "Neon Carrot");
Color.addToMap("#FE4164", "Neon fuchsia");
Color.addToMap("#39FF14", "Neon green");
Color.addToMap("#214FC6", "New Car");
Color.addToMap("#D7837F", "New York pink");
Color.addToMap("#A4DDED", "Non-photo blue");
Color.addToMap("#059033", "North Texas Green");
Color.addToMap("#E9FFDB", "Nyanza");
Color.addToMap("#0077BE", "Ocean Boat Blue");
Color.addToMap("#CC7722", "Ochre");
Color.addToMap("#43302E", "Old burgundy");
Color.addToMap("#CFB53B", "Old gold");
Color.addToMap("#FDF5E6", "Old lace");
Color.addToMap("#796878", "Old lavender");
Color.addToMap("#673147", "Old mauve");
Color.addToMap("#867E36", "Old moss green");
Color.addToMap("#C08081", "Old rose");
Color.addToMap("#808000", "Olive");
Color.addToMap("#6B8E23", "Olive Drab #3");
Color.addToMap("#3C341F", "Olive Drab #7");
Color.addToMap("#9AB973", "Olivine");
Color.addToMap("#353839", "Onyx");
Color.addToMap("#B784A7", "Opera mauve");
Color.addToMap("#FF7F00", "Orange");
Color.addToMap("#FF7538", "Orange (Crayola)");
Color.addToMap("#FF5800", "Orange (Pantone)");
Color.addToMap("#FB9902", "Orange (RYB)");
Color.addToMap("#FFA500", "Orange (web)");
Color.addToMap("#FF9F00", "Orange peel");
Color.addToMap("#FF4500", "Orange-red");
Color.addToMap("#DA70D6", "Orchid");
Color.addToMap("#F2BDCD", "Orchid pink");
Color.addToMap("#FB4F14", "Orioles orange");
Color.addToMap("#414A4C", "Outer Space");
Color.addToMap("#FF6E4A", "Outrageous Orange");
Color.addToMap("#002147", "Oxford Blue");
Color.addToMap("#990000", "Crimson Red");
Color.addToMap("#006600", "Pakistan green");
Color.addToMap("#273BE2", "Palatinate blue");
Color.addToMap("#682860", "Palatinate purple");
Color.addToMap("#BCD4E6", "Pale aqua");
Color.addToMap("#AFEEEE", "Pale blue");
Color.addToMap("#987654", "Pale brown");
Color.addToMap("#9BC4E2", "Pale cerulean");
Color.addToMap("#DDADAF", "Pale chestnut");
Color.addToMap("#DA8A67", "Pale copper");
Color.addToMap("#ABCDEF", "Pale cornflower blue");
Color.addToMap("#E6BE8A", "Pale gold");
Color.addToMap("#EEE8AA", "Pale goldenrod");
Color.addToMap("#98FB98", "Pale green");
Color.addToMap("#DCD0FF", "Pale lavender");
Color.addToMap("#F984E5", "Pale magenta");
Color.addToMap("#FADADD", "Pale pink");
Color.addToMap("#DDA0DD", "Pale plum");
Color.addToMap("#DB7093", "Pale red-violet");
Color.addToMap("#96DED1", "Pale robin egg blue");
Color.addToMap("#C9C0BB", "Pale silver");
Color.addToMap("#ECEBBD", "Pale spring bud");
Color.addToMap("#BC987E", "Pale taupe");
Color.addToMap("#78184A", "Pansy purple");
Color.addToMap("#009B7D", "Paolo Veronese green");
Color.addToMap("#FFEFD5", "Papaya whip");
Color.addToMap("#E63E62", "Paradise pink");
Color.addToMap("#AEC6CF", "Pastel blue");
Color.addToMap("#836953", "Pastel brown");
Color.addToMap("#CFCFC4", "Pastel gray");
Color.addToMap("#77DD77", "Pastel green");
Color.addToMap("#F49AC2", "Pastel magenta");
Color.addToMap("#FFB347", "Pastel orange");
Color.addToMap("#DEA5A4", "Pastel pink");
Color.addToMap("#B39EB5", "Pastel purple");
Color.addToMap("#FF6961", "Pastel red");
Color.addToMap("#CB99C9", "Pastel violet");
Color.addToMap("#FDFD96", "Pastel yellow");
Color.addToMap("#FFE5B4", "Peach");
Color.addToMap("#FFCC99", "Peach-orange");
Color.addToMap("#FFDAB9", "Peach puff");
Color.addToMap("#FADFAD", "Peach-yellow");
Color.addToMap("#D1E231", "Pear");
Color.addToMap("#EAE0C8", "Pearl");
Color.addToMap("#88D8C0", "Pearl Aqua");
Color.addToMap("#B768A2", "Pearly purple");
Color.addToMap("#E6E200", "Peridot");
Color.addToMap("#1C39BB", "Persian blue");
Color.addToMap("#00A693", "Persian green");
Color.addToMap("#32127A", "Persian indigo");
Color.addToMap("#D99058", "Persian orange");
Color.addToMap("#F77FBE", "Persian pink");
Color.addToMap("#701C1C", "Persian plum");
Color.addToMap("#CC3333", "Persian red");
Color.addToMap("#FE28A2", "Persian rose");
Color.addToMap("#EC5800", "Persimmon");
Color.addToMap("#CD853F", "Peru");
Color.addToMap("#000F89", "Phthalo blue");
Color.addToMap("#123524", "Phthalo green");
Color.addToMap("#45B1E8", "Picton blue");
Color.addToMap("#C30B4E", "Pictorial carmine");
Color.addToMap("#FDDDE6", "Piggy pink");
Color.addToMap("#01796F", "Pine green");
Color.addToMap("#FFC0CB", "Pink");
Color.addToMap("#D74894", "Pink (Pantone)");
Color.addToMap("#FFDDF4", "Pink lace");
Color.addToMap("#D8B2D1", "Pink lavender");
Color.addToMap("#FF9966", "Pink-orange");
Color.addToMap("#E7ACCF", "Pink pearl");
Color.addToMap("#F78FA7", "Pink Sherbet");
Color.addToMap("#93C572", "Pistachio");
Color.addToMap("#E5E4E2", "Platinum");
Color.addToMap("#8E4585", "Plum");
Color.addToMap("#BE4F62", "Popstar");
Color.addToMap("#FF5A36", "Portland Orange");
Color.addToMap("#B0E0E6", "Powder blue");
Color.addToMap("#FF8F00", "Princeton orange");
Color.addToMap("#003153", "Prussian blue");
Color.addToMap("#DF00FF", "Psychedelic purple");
Color.addToMap("#CC8899", "Puce");
Color.addToMap("#644117", "Pullman Brown (UPS Brown)");
Color.addToMap("#FF7518", "Pumpkin");
Color.addToMap("#800080", "Deep purple");
Color.addToMap("#9F00C5", "Purple (Munsell)");
Color.addToMap("#A020F0", "Purple");
Color.addToMap("#69359C", "Purple Heart");
Color.addToMap("#9678B6", "Purple mountain majesty");
Color.addToMap("#4E5180", "Purple navy");
Color.addToMap("#FE4EDA", "Purple pizzazz");
Color.addToMap("#50404D", "Purple taupe");
Color.addToMap("#9A4EAE", "Purpureus");
Color.addToMap("#51484F", "Quartz");
Color.addToMap("#436B95", "Queen blue");
Color.addToMap("#E8CCD7", "Queen pink");
Color.addToMap("#8E3A59", "Quinacridone magenta");
Color.addToMap("#FF355E", "Radical Red");
Color.addToMap("#FBAB60", "Rajah");
Color.addToMap("#E30B5D", "Raspberry");
Color.addToMap("#E25098", "Raspberry pink");
Color.addToMap("#B3446C", "Raspberry rose");
Color.addToMap("#826644", "Raw umber");
Color.addToMap("#FF33CC", "Razzle dazzle rose");
Color.addToMap("#E3256B", "Razzmatazz");
Color.addToMap("#8D4E85", "Razzmic Berry");
Color.addToMap("#FF0000", "Red");
Color.addToMap("#EE204D", "Red (Crayola)");
Color.addToMap("#F2003C", "Red (Munsell)");
Color.addToMap("#C40233", "Red (NCS)");
Color.addToMap("#ED1C24", "Red (pigment)");
Color.addToMap("#FE2712", "Red (RYB)");
Color.addToMap("#A52A2A", "Red-brown");
Color.addToMap("#860111", "Red devil");
Color.addToMap("#FF5349", "Red-orange");
Color.addToMap("#E40078", "Red-purple");
Color.addToMap("#C71585", "Red-violet");
Color.addToMap("#A45A52", "Redwood");
Color.addToMap("#522D80", "Regalia");
Color.addToMap("#002387", "Resolution blue");
Color.addToMap("#777696", "Rhythm");
Color.addToMap("#004040", "Rich black");
Color.addToMap("#F1A7FE", "Rich brilliant lavender");
Color.addToMap("#D70040", "Rich carmine");
Color.addToMap("#0892D0", "Rich electric blue");
Color.addToMap("#A76BCF", "Rich lavender");
Color.addToMap("#B666D2", "Rich lilac");
Color.addToMap("#B03060", "Rich maroon");
Color.addToMap("#444C38", "Rifle green");
Color.addToMap("#704241", "Deep Roast coffee");
Color.addToMap("#00CCCC", "Robin egg blue");
Color.addToMap("#8A7F80", "Rocket metallic");
Color.addToMap("#838996", "Roman silver");
Color.addToMap("#F9429E", "Rose bonbon");
Color.addToMap("#674846", "Rose ebony");
Color.addToMap("#B76E79", "Rose gold");
Color.addToMap("#FF66CC", "Rose pink");
Color.addToMap("#C21E56", "Rose red");
Color.addToMap("#905D5D", "Rose taupe");
Color.addToMap("#AB4E52", "Rose vale");
Color.addToMap("#65000B", "Rosewood");
Color.addToMap("#D40000", "Rosso corsa");
Color.addToMap("#BC8F8F", "Rosy brown");
Color.addToMap("#0038A8", "Royal azure");
Color.addToMap("#002366", "Royal blue");
Color.addToMap("#4169E1", "Royal light blue");
Color.addToMap("#CA2C92", "Royal fuchsia");
Color.addToMap("#7851A9", "Royal purple");
Color.addToMap("#FADA5E", "Royal yellow");
Color.addToMap("#CE4676", "Ruber");
Color.addToMap("#D10056", "Rubine red");
Color.addToMap("#E0115F", "Ruby");
Color.addToMap("#9B111E", "Ruby red");
Color.addToMap("#FF0028", "Ruddy");
Color.addToMap("#BB6528", "Ruddy brown");
Color.addToMap("#E18E96", "Ruddy pink");
Color.addToMap("#A81C07", "Rufous");
Color.addToMap("#80461B", "Russet");
Color.addToMap("#679267", "Russian green");
Color.addToMap("#32174D", "Russian violet");
Color.addToMap("#B7410E", "Rust");
Color.addToMap("#DA2C43", "Rusty red");
Color.addToMap("#8B4513", "Saddle brown");
Color.addToMap("#FF6700", "Safety orange (blaze orange)");
Color.addToMap("#EED202", "Safety yellow");
Color.addToMap("#F4C430", "Saffron");
Color.addToMap("#BCB88A", "Sage");
Color.addToMap("#23297A", "St. Patrick's blue");
Color.addToMap("#FA8072", "Salmon");
Color.addToMap("#FF91A4", "Salmon pink");
Color.addToMap("#C2B280", "Sand");
Color.addToMap("#ECD540", "Sandstorm");
Color.addToMap("#F4A460", "Sandy brown");
Color.addToMap("#92000A", "Sangria");
Color.addToMap("#507D2A", "Sap green");
Color.addToMap("#0F52BA", "Sapphire");
Color.addToMap("#0067A5", "Sapphire blue");
Color.addToMap("#CBA135", "Satin sheen gold");
Color.addToMap("#FF2400", "Scarlet");
Color.addToMap("#FFD800", "School bus yellow");
Color.addToMap("#76FF7A", "Screamin' Green");
Color.addToMap("#006994", "Sea blue");
Color.addToMap("#2E8B57", "Sea green");
Color.addToMap("#321414", "Seal brown");
Color.addToMap("#FFF5EE", "Seashell");
Color.addToMap("#FFBA00", "Selective yellow");
Color.addToMap("#704214", "Sepia");
Color.addToMap("#8A795D", "Shadow");
Color.addToMap("#778BA5", "Shadow blue");
Color.addToMap("#FFCFF1", "Shampoo");
Color.addToMap("#009E60", "Shamrock green");
Color.addToMap("#8FD400", "Sheen Green");
Color.addToMap("#D98695", "Shimmering Blush");
Color.addToMap("#FC0FC0", "Shocking pink");
Color.addToMap("#882D17", "Sienna");
Color.addToMap("#C0C0C0", "Silver");
Color.addToMap("#ACACAC", "Silver chalice");
Color.addToMap("#5D89BA", "Silver Lake blue");
Color.addToMap("#C4AEAD", "Silver pink");
Color.addToMap("#BFC1C2", "Silver sand");
Color.addToMap("#CB410B", "Sinopia");
Color.addToMap("#007474", "Skobeloff");
Color.addToMap("#87CEEB", "Sky blue");
Color.addToMap("#CF71AF", "Sky magenta");
Color.addToMap("#6A5ACD", "Slate blue");
Color.addToMap("#708090", "Slate gray");
Color.addToMap("#C84186", "Smitten");
Color.addToMap("#738276", "Smoke");
Color.addToMap("#933D41", "Smokey topaz");
Color.addToMap("#100C08", "Smoky black");
Color.addToMap("#FFFAFA", "Snow");
Color.addToMap("#CEC8EF", "Soap");
Color.addToMap("#893843", "Solid pink");
Color.addToMap("#757575", "Sonic silver");
Color.addToMap("#9E1316", "Spartan Crimson");
Color.addToMap("#1D2951", "Space cadet");
Color.addToMap("#807532", "Spanish bistre");
Color.addToMap("#0070B8", "Spanish blue");
Color.addToMap("#D10047", "Spanish carmine");
Color.addToMap("#E51A4C", "Spanish crimson");
Color.addToMap("#989898", "Spanish gray");
Color.addToMap("#009150", "Spanish green");
Color.addToMap("#E86100", "Spanish orange");
Color.addToMap("#F7BFBE", "Spanish pink");
Color.addToMap("#E60026", "Spanish red");
Color.addToMap("#4C2882", "Spanish violet");
Color.addToMap("#007F5C", "Spanish viridian");
Color.addToMap("#0FC0FC", "Spiro Disco Ball");
Color.addToMap("#A7FC00", "Spring bud");
Color.addToMap("#00FF7F", "Spring green");
Color.addToMap("#007BB8", "Star command blue");
Color.addToMap("#4682B4", "Steel blue");
Color.addToMap("#CC33CC", "Steel pink");
Color.addToMap("#4F666A", "Stormcloud");
Color.addToMap("#E4D96F", "Straw");
Color.addToMap("#FC5A8D", "Strawberry");
Color.addToMap("#FFCC33", "Sunglow");
Color.addToMap("#E3AB57", "Sunray");
Color.addToMap("#FAD6A5", "Sunset");
Color.addToMap("#FD5E53", "Sunset orange");
Color.addToMap("#CF6BA9", "Super pink");
Color.addToMap("#D2B48C", "Tan");
Color.addToMap("#F94D00", "Tangelo");
Color.addToMap("#F28500", "Tangerine");
Color.addToMap("#FFCC00", "Tangerine yellow");
Color.addToMap("#483C32", "Dark Grayish Brown");
Color.addToMap("#8B8589", "Taupe gray");
Color.addToMap("#D0F0C0", "Tea green");
Color.addToMap("#F4C2C2", "Tea rose");
Color.addToMap("#008080", "Teal");
Color.addToMap("#367588", "Teal blue");
Color.addToMap("#99E6B3", "Teal deer");
Color.addToMap("#00827F", "Teal green");
Color.addToMap("#CF3476", "Telemagenta");
Color.addToMap("#CD5700", "Tenne");
Color.addToMap("#E2725B", "Terra cotta");
Color.addToMap("#D8BFD8", "Thistle");
Color.addToMap("#DE6FA1", "Thulian pink");
Color.addToMap("#FC89AC", "Tickle Me Pink");
Color.addToMap("#0ABAB5", "Tiffany Blue");
Color.addToMap("#E08D3C", "Tiger's eye");
Color.addToMap("#DBD7D2", "Timberwolf");
Color.addToMap("#EEE600", "Titanium yellow");
Color.addToMap("#FF6347", "Tomato");
Color.addToMap("#746CC0", "Toolbox");
Color.addToMap("#FFC87C", "Topaz");
Color.addToMap("#FD0E35", "Tractor red");
Color.addToMap("#00755E", "Tropical rain forest");
Color.addToMap("#0073CF", "True Blue");
Color.addToMap("#417DC1", "Tufts Blue");
Color.addToMap("#FF878D", "Tulip");
Color.addToMap("#DEAA88", "Tumbleweed");
Color.addToMap("#B57281", "Turkish rose");
Color.addToMap("#40E0D0", "Turquoise");
Color.addToMap("#00FFEF", "Turquoise blue");
Color.addToMap("#A0D6B4", "Turquoise green");
Color.addToMap("#7C4848", "Tuscan red");
Color.addToMap("#C09999", "Tuscany");
Color.addToMap("#8A496B", "Twilight lavender");
Color.addToMap("#0033AA", "UA blue");
Color.addToMap("#D9004C", "UA red");
Color.addToMap("#8878C3", "Ube");
Color.addToMap("#536895", "UCLA Blue");
Color.addToMap("#FFB300", "UCLA Gold");
Color.addToMap("#3CD070", "UFO Green");
Color.addToMap("#120A8F", "Ultramarine");
Color.addToMap("#4166F5", "Ultramarine blue");
Color.addToMap("#FF6FFF", "Ultra pink");
Color.addToMap("#635147", "Umber");
Color.addToMap("#FFDDCA", "Unbleached silk");
Color.addToMap("#5B92E5", "United Nations blue");
Color.addToMap("#B78727", "University of California Gold");
Color.addToMap("#FFFF66", "Unmellow yellow");
Color.addToMap("#7B1113", "UP Maroon");
Color.addToMap("#AE2029", "Upsdell red");
Color.addToMap("#E1AD21", "Urobilin");
Color.addToMap("#004F98", "USAFA blue");
Color.addToMap("#F77F00", "University of Tennessee Orange");
Color.addToMap("#D3003F", "Utah Crimson");
Color.addToMap("#F3E5AB", "Vanilla");
Color.addToMap("#F38FA9", "Vanilla ice");
Color.addToMap("#C5B358", "Vegas gold");
Color.addToMap("#C80815", "Venetian red");
Color.addToMap("#43B3AE", "Verdigris");
Color.addToMap("#E34234", "Medium vermilion");
Color.addToMap("#D9381E", "Vermilion");
Color.addToMap("#8F00FF", "Violet");
Color.addToMap("#7F00FF", "Violet (color wheel)");
Color.addToMap("#8601AF", "Violet (RYB)");
Color.addToMap("#324AB2", "Violet-blue");
Color.addToMap("#F75394", "Violet-red");
Color.addToMap("#40826D", "Viridian");
Color.addToMap("#009698", "Viridian green");
Color.addToMap("#922724", "Vivid auburn");
Color.addToMap("#9F1D35", "Vivid burgundy");
Color.addToMap("#DA1D81", "Vivid cerise");
Color.addToMap("#CC00FF", "Vivid orchid");
Color.addToMap("#00CCFF", "Vivid sky blue");
Color.addToMap("#FFA089", "Vivid tangerine");
Color.addToMap("#9F00FF", "Vivid violet");
Color.addToMap("#004242", "Warm black");
Color.addToMap("#A4F4F9", "Waterspout");
Color.addToMap("#645452", "Wenge");
Color.addToMap("#F5DEB3", "Wheat");
Color.addToMap("#FFFFFF", "White");
Color.addToMap("#F5F5F5", "White smoke");
Color.addToMap("#A2ADD0", "Wild blue yonder");
Color.addToMap("#D470A2", "Wild orchid");
Color.addToMap("#FF43A4", "Wild Strawberry");
Color.addToMap("#FC6C85", "Wild watermelon");
Color.addToMap("#FD5800", "Willpower orange");
Color.addToMap("#A75502", "Windsor tan");
Color.addToMap("#722F37", "Wine");
Color.addToMap("#C9A0DC", "Wisteria");
Color.addToMap("#C19A6B", "Wood brown");
Color.addToMap("#738678", "Xanadu");
Color.addToMap("#0F4D92", "Yale Blue");
Color.addToMap("#1C2841", "Yankees blue");
Color.addToMap("#FCE883", "Yellow (Crayola)");
Color.addToMap("#EFCC00", "Yellow (Munsell)");
Color.addToMap("#FEDF00", "Yellow (Pantone)");
Color.addToMap("#FEFE33", "Yellow");
Color.addToMap("#9ACD32", "Yellow Green");
Color.addToMap("#FFAE42", "Yellow Orange");
Color.addToMap("#FFF000", "Yellow rose");
Color.addToMap("#0014A8", "Zaffre");
Color.addToMap("#2C1608", "Zinnwaldite brown");
Color.addToMap("#39A78E", "Zomp");
