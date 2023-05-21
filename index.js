// dotenv
require("dotenv").config();

// call new Server
global.WebSocket = require("ws");
global.EventEmitter = require("events").EventEmitter;
global.fs = require("fs");
const AsyncConsole = require("asyncconsole");

global.isString = function (a) {
    return typeof a === "string";
};

global.isBool = function (a) {
    return typeof a === "boolean";
};

global.isObj = function (a) {
    return typeof a === "object" && !Array.isArray(a) && a !== null;
};

const { Server, ADMIN_PARTICIPANT } = require("./src/Server.js");
const config = require("./config");
Server.start(config);
global.SERVER = Server;

const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const { InternalBot } = require("./src/InternalBot");

let consoleChannel = "lobby";
let consolePrefixes = ["/", "!"];

rl.on("line", data => {
    const msg = {
        a: data,
        p: ADMIN_PARTICIPANT,
        t: Date.now()
    };

    const msgmod = {};
    Object.assign(msgmod, msg);
    msgmod.args = msg.a.split(" ");
    msgmod.argcat = msg.a.substring(msgmod.args[0].length).trim();

    let isCommand = false;
    const ch = Server.channels.get(consoleChannel);

    for (const p of consolePrefixes) {
        if (msgmod.args[0].startsWith(p)) {
            isCommand = true;
        }
    }

    if (!isCommand) {
        // send chat message
        ch.adminChat(msg.a);
    } else {
        InternalBot.emit("receive message", msg, undefined, ch);
    }
});

// dev environment

if (config.hostDevFiles) {
    let express_logger = new (require("./src/Logger"))("Express Server");
    const express = require("express");
    const app = express();
    const path = require("path");
    var http = require("http");

    let dir = path.join(__dirname, "mpp.hri7566.info");
    app.use(express.static(path.join(__dirname, dir)));

    app.get("*", (req, res, next) => {
        let file = path.join(dir, req.path);
        if (
            fs.existsSync(file) &&
            !file.endsWith("/") &&
            !file.endsWith("\\")
        ) {
            res.sendFile(file);
        } else {
            res.sendFile(path.join(dir, "index.html"));
        }
    });

    const express_port = 8075;

    http.createServer(app).listen(express_port);
}

if (config.enableMPPCloneBot) {
    require("./mppclonebot");
}
