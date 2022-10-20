const YAML = require('yaml');
const path = require('path');
const fs = require('fs');
const { Logger } = require('./Logger');
const EventEmitter = require('events');
const http = require('http');
const https = require('https');
const express = require('express');
const uWebSockets = require('uWebSockets.js');
const expressify = require('uwebsockets-express');
const { ServerClient } = require('./ServerClient');

const CONFIG_PATH = path.resolve(__dirname, '../config.yml');

let serverConfig;

try {
    serverConfig = YAML.parse(fs.readFileSync(CONFIG_PATH).toString());
} catch (err) {
    if (err) {
        console.error('Could not load config:', err);
        process.exit(-1);
    }
}

class Server {
    static on = EventEmitter.prototype.on;
    static off = EventEmitter.prototype.off;
    static once = EventEmitter.prototype.once;
    static emit = EventEmitter.prototype.emit;
    
    static config = serverConfig;
    
    static INCOMING_MESSAGES = [
        'hi',
        'bye',
        'data',
        't'
    ];

    static motd = this.config.server.motd || 'flask zengytes';

    static async start() {
        this.logger = new Logger('Server', Logger.GREEN);
        this.logger.log('Starting...');

        if (this.config.server.tls == true || process.env.TLS == 'true') {
            this.uws = uWebSockets.SSLApp({
                key_file_name: path.reslove(__dirname, '..', this.config.server.keyPath),
                cert_file_name: path.resolve(__dirname, '..', this.config.server.certPath)
            });
        } else {
            this.uws = uWebSockets.App();
        }

        if (!this.uws) {
            this.logger.warn('Server not started.');
        } else {
            this.listen();
        }
    }

    static async stop() {
        this.logger.log('Stopping...');
    }

    static async listen() {
        if (this.config.server.hostFiles == true) {
            this.app = expressify.default(this.uws);
            this.app.use(express.static(path.resolve(__dirname, '../' + this.config.server.staticPath)));
            
            this.app.get('*', (req, res) => {
                res.send(fs.readFileSync(path.resolve(__dirname, '../', path.join(this.config.server.staticPath, 'index.html'))).toString());
            });
        }

        this.uws.ws('/', {
            idleTimeout: 32,
            maxBackpressure: 1024,
            maxPayloadLength: 2048,
            message: (...args) => this.handleWSMessage(...args),
            open: ws => this.handleConnection(ws)
        }).listen(this.config.server.port, listen => {
            if (listen) {
                this.logger.log(`Server started on port ${this.config.server.port}`);
            }
        });

        this.on('hi', () => {

        });

        this.on('bye', () => {

        });

        this.on('t', (ws, msg) => {
            console.log(msg);
            ws.send(JSON.stringify([{
                m: 't',
                t: Date.now(),
                e: msg.e
            }]));
        });
    }

    static async handleWSMessage(ws, message, isBinary) {
        let msgs;

        try {
            msgs = JSON.parse(Buffer.from(message).toString());
        } catch (err) {
            this.logger.log("Invalid message received");
            return;
        }

        for (let msg of msgs) {
            if (typeof msg.m == 'undefined') return;
            
        }
    }

    static async handleConnection(ws) {
        try {
            let cl = new ServerClient(ws);
        } catch (err) {
            this.logger.warn('Unable to create client')
        }
    }
}

module.exports = {
    Server
}
