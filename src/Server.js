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
const { Crypto } = require('./Crypto');
const { Data } = require('./Data');

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
    static clients = new Map();

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

        await Data.connect(this.config.database);

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
            open: ws => this.handleConnection(ws),
            close: (ws, code, message) => this.handleDisconnection(ws, code, message)
        }).listen(this.config.server.port, listen => {
            if (listen) {
                this.logger.log(`Server started on port ${this.config.server.port}`);
            }
        });
    }

    static findClientByWS(ws) {
        for (let cl of this.clients.keys()) {
            if (cl.ws == ws) {
                return cl;
            }
        }
    }

    static findClient(id) {
        for (let cl of this.clients.keys()) {
            if (id == this.clients.get(cl)) {
                return cl;
            }
        }
    }

    static async handleWSMessage(ws, message, isBinary) {
        let msgs;

        let cl = this.findClientByWS(ws);
        if (!cl) return;
        if (cl.closed) return;

        try {
            let msgs = JSON.parse(Buffer.from(message).toString());

            for (let msg of msgs) {
                if (!msg.hasOwnProperty('m')) return;
                cl.emit(msg.m, msg);
            }
        } catch (err) {
            this.logger.error(err);
            this.logger.warn('Invalid message received');
        }
    }

    static async handleConnection(ws) {
        try {
            let cl = new ServerClient(this, ws);
            this.clients.set(cl, Crypto.randomID());
        } catch (err) {
            this.logger.error(err);
            this.logger.warn('Unable to create client')
        }
    }

    static async handleDisconnection(ws, code, message) {
        try {
            let cl = this.findClientByWS(ws);
            if (!cl) return;
            this.logger.debug('Closing socket...');
            cl.setClosed(true);
            cl.destroy();
        } catch (err) {
            this.logger.error(err);
            this.logger.warn('Unable to disconnect client, possibly a memory leak');
        }
    }

    static getDefaultUser(_id) {
        return {
            _id,
            name: this.config.users.defaultName,
            flags: this.config.users.defaultFlags,
            color: Crypto.getColor(_id)
        }
    }

    static getParticipantID(cl) {
        return this.clients.get(cl);
    }

    static changeID(cl, id) {
        this.clients.set(cl, id);
    }
}

module.exports = {
    Server
}
