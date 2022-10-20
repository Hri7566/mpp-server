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

class Server extends EventEmitter {
    static config = serverConfig;
    static logger = new Logger('Server', Logger.GREEN);

    static async start() {
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
            message: this.handleWSMessage
        }).listen(this.config.server.port, listen => {
            if (listen) {
                this.logger.log(`Server started on port ${this.config.server.port}`);
            }
        });
    }

    static async handleWSMessage(ws, message, isBinary) {
        let jmsgs;
        let msgs;
        
        try {
            jmsgs = Buffer.from(message).toString();
            msgs = JSON.parse(jmsgs);
        } catch (err) {}

        let user = {
            name: 'Anonymous',
            color: '#8d3f50',
            _id: 0,
            id: 0
        }

        try {
            for (let msg of msgs) {
                console.log(msg);

                switch (msg.m) {
                    case 'hi':
                        ws.send(JSON.stringify({
                            m: 'hi',
                            u: user,
                            t: Date.now()
                        }));

                        ws.send(JSON.stringify({
                            m: 'ch',
                            ch: {
                                _id: 'lobby',
                                settings: {
                                    lobby: true,
                                    chat: true
                                }
                            },
                            ppl: [
                                user
                            ],
                            count: 1,
                            id: 0
                        }));
                        
                        break;
                }
            }
        } catch (err) {}
    }
}

module.exports = {
    Server
}
