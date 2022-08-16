// dotenv
require('dotenv').config();

// call new Server
global.WebSocket = require('ws');
global.EventEmitter = require('events').EventEmitter;
global.fs = require('fs');
const AsyncConsole = require('asyncconsole');

global.isString = function(a) {
	return typeof a === 'string';
}

global.isBool = function(a) {
	return typeof a === 'boolean';
}

global.isObj = function(a) {
	return typeof a === "object" && !Array.isArray(a) && a !== null;
}

let Server = require("./src/Server.js");
let config = require('./config');
Server.start(config);
global.SERVER = Server;

// doesn't work with pm2

/*
let console = process.platform == 'win32' ? new AsyncConsole("", input => {
    try {
        console.log(JSON.stringify(eval(input)));
    } catch(e) {
        console.log(e.toString());
    }
}) : {};
*/






// dev environment

if (config.hostDevFiles) {
    let express_logger = new (require("./src/Logger"))("Express Server");
    const express = require('express');
    const app = express();
    const path = require('path');
    var http = require('http');

    let dir = path.join(__dirname, 'mpp.hri7566.info');
    app.use(express.static(path.join(__dirname, dir)));

    app.get('*', (req, res, next) => {
        let file = path.join(dir, req.path);
        if (fs.existsSync(file)) {
            res.sendFile(file);
        } else {
            res.sendFile(path.join(dir, 'index.html'));
        }
    });

    const express_port = 8075;

    http.createServer(app).listen(express_port);
}

if (config.enableMPPCloneBot) {
    require('./mppclonebot');
}
