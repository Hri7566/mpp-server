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
client.start();
client.on("connect", function () {
    console.log("connected");
});
client.on("hi", function () {
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

        var SPOOP_CHANNEL = "test/:)";
        var SPOOP_DURATION = 7000;

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
                if (1) {
                    //if(channel._id === SPOOP_CHANNEL) {
                    var participants = channel.participants;
                    var users = {};
                    for (var j = 0; j < participants.length; j++) {
                        var part = participants[j];
                        users[part.user._id] = part.user;
                    }
                    for (var j in users) {
                        client.sendArray([
                            {
                                m: "admin message",
                                password: password,
                                msg: {
                                    m: "name",
                                    _id: users[j]._id,
                                    name: spoop_text(users[j].name)
                                }
                            }
                        ]);
                        client.sendArray([
                            {
                                m: "admin message",
                                password: password,
                                msg: {
                                    m: "color",
                                    _id: users[j]._id,
                                    color: "#000000"
                                }
                            }
                        ]);
                        client.sendArray([
                            {
                                m: "admin message",
                                password: password,
                                msg: {
                                    m: "user_flag",
                                    _id: users[j]._id,
                                    key: "chat_curse_1",
                                    value: 1
                                }
                            }
                        ]);
                        client.sendArray([
                            {
                                m: "admin message",
                                password: password,
                                msg: {
                                    m: "user_flag",
                                    _id: users[j]._id,
                                    key: "chat_curse_2",
                                    value: 1
                                }
                            }
                        ]);
                        client.sendArray([
                            {
                                m: "admin message",
                                password: password,
                                msg: {
                                    m: "user_flag",
                                    _id: users[j]._id,
                                    key: "freeze_name",
                                    value: 1
                                }
                            }
                        ]);
                        /*client.sendArray([{m: "admin message", password: password,
                            msg: {"m": "notification", "class":"short","targetChannel":SPOOP_CHANNEL,"html":"<style>.cursor{width:100000px;height:100000px;margin-left:-50000px;margin-top:-50000px}</style>","duration":SPOOP_DURATION}}]);*/
                    }
                    setTimeout(function () {
                        for (var j in users) {
                            client.sendArray([
                                {
                                    m: "admin message",
                                    password: password,
                                    msg: {
                                        m: "name",
                                        _id: users[j]._id,
                                        name: users[j].name
                                    }
                                }
                            ]);
                            client.sendArray([
                                {
                                    m: "admin message",
                                    password: password,
                                    msg: {
                                        m: "color",
                                        _id: users[j]._id,
                                        color: users[j].color
                                    }
                                }
                            ]);
                            client.sendArray([
                                {
                                    m: "admin message",
                                    password: password,
                                    msg: {
                                        m: "user_flag",
                                        _id: users[j]._id,
                                        key: "chat_curse_1",
                                        value: 0
                                    }
                                }
                            ]);
                            client.sendArray([
                                {
                                    m: "admin message",
                                    password: password,
                                    msg: {
                                        m: "user_flag",
                                        _id: users[j]._id,
                                        key: "chat_curse_2",
                                        value: 0
                                    }
                                }
                            ]);
                            client.sendArray([
                                {
                                    m: "admin message",
                                    password: password,
                                    msg: {
                                        m: "user_flag",
                                        _id: users[j]._id,
                                        key: "freeze_name",
                                        value: 0
                                    }
                                }
                            ]);
                        }
                        setTimeout(function () {
                            process.exit();
                        }, 1000);
                    }, SPOOP_DURATION);
                }
            }
        });
    });
});
