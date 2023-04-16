// var Client = require("../multiplayerpiano/static/Client.js");
const Client = require("../../mpp.hri7566.info/Client.js");
var level = require("level");
var fs = require("fs");
var crypto = require("crypto");

process.stdout.write(
    "\n********************************START********************************\n"
);

// var client = new Client("wss://www.multiplayerpiano.com");
var client = new Client("wss://mpp.hri7566.info:8443");
// var client = new Client("ws://127.0.0.1:8443");
client.on("connect", function () {
    console.log("connected");
});
client.on("hi", function () {
    console.log("hi");
    fs.readFile("./password.txt", function (err, data) {
        if (err) throw err;
        var password = new String(data).trim();

        client.sendArray([
            {
                m: "subscribe to admin stream",
                password: password,
                interval_ms: 10000000
            }
        ]);

        var BATTLE_CHANNEL = "test/:)";
        var BATTLE_DURATION = 7000;

        function spoop_text(message) {
            var old = message;
            message = "";
            for (var i = 0; i < old.length; i++) {
                if (Math.random() < 0.9) {
                    message += String.fromCharCode(
                        old.charCodeAt(i) + Math.floor(Math.random() * 20 - 10)
                    );
                    //message[i] = String.fromCharCode(Math.floor(Math.random() * 255));
                } else {
                    message += old[i];
                }
            }
            return message;
        }

        client.on("data", function (msg) {
            console.log("data");
            for (var i = 0; i < msg.channelManager.channels.length; i++) {
                var channel = msg.channelManager.channels[i];
                if (channel._id == BATTLE_CHANNEL) {
                    console.log("sending messages");
                    client.sendArray([
                        {
                            m: "admin message",
                            password: password,
                            msg: {
                                m: "notification",
                                id: "ebbattle",
                                targetChannel: client.channel._id,
                                duration: "7000",
                                class: "short",
                                html: `<p></p>`
                            }
                        }
                    ]);

                    setTimeout(() => {
                        client.sendArray([
                            {
                                m: "admin message",
                                password: password,
                                msg: {
                                    m: "notification",
                                    id: "ebbattle",
                                    targetChannel: client.channel._id,
                                    duration: "7000",
                                    class: "short",
                                    html:
                                        `<script>` +
                                        stop.toString() +
                                        `</script>`
                                }
                            }
                        ]);
                    }, BATTLE_DURATION);
                }
            }
        });
    });
});

function start() {
    var ebcanv = `<canvas id="ebbattle" style="
                    padding: 0;
            margin: 0;
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            left: 0;
        image-rendering: pixelated;
    ">`;
    $("body").append(ebcanv);

    /*
    var canvas = document.getElementById("ebbattle");
    var ctx = canvas.getContext("2d");
    */

    globalThis.params = {
        layer1: 182,
        layer2: 181
    };

    var ebbattlescript = document.createElement("script");
    ebbattlescript.src = "ebbattle/index.js";
    ebbattlescript.type = "module";
    ebbattlescript.module = true;
    console.log(ebbattlescript);
    $("head").append(ebbattlescript);
}

client.start();

function stop() {
    window.location.reload();
}
