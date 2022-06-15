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
global.SERVER = new Server(config);

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
    const express = require('express');
    const app = express();
    const path = require('path');
    app.listen(8075, () => {
    });

    app.use(express.static(path.join(__dirname, 'mpp.hri7566.info')));
}

if (config.enableMPPCloneBot) {
    require('./mppclonebot');
}
