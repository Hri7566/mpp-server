import uWS from 'uWebSockets.js';
import express from 'express';
import expressify from 'uwebsockets-express';
import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import { Data } from "./Data";

const PORT = process.env.PORT || 8443;
const SSL = process.env.SSL || 'false';
const SSL_CERT_PATH = process.env.SSL_KEY_PATH || 'ssl/cert.pem';
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || 'ssl/key.pem';

let cert: Buffer, key: Buffer;

if (SSL == 'true') {
    try {
        cert = fs.readFileSync(SSL_CERT_PATH);
        key = fs.readFileSync(SSL_CERT_PATH);
    } catch (err) {
        console.error('Could not read SSL certificatekey:', err);
        process.exit(1);
    }
}

export class Server {
    public static wss: any; // websocket server
    public static app: Express.Application; // express app
    public static httpServer: http.Server | https.Server; // underlying http server

    public static async start(): Promise<void> {
        Data.start();
        
        this.app = express();

        if (Boolean(SSL)) {
            this.httpServer = https.createServer({
                cert, key
            }, (this.app as any));

            this.wss = uWS.SSLApp({
                key_file_name: 'ssl/key.pem',
                cert_file_name: 'ssl/cert.pem'
            });
        } else {
            this.httpServer = http.createServer({

            }, (this.app as any));
            
            this.wss = uWS.App();
        }
        

        this.listen();
    }

    public static isListening = false;

    public static async listen(): Promise<any> {
        if (this.isListening) return;

        this.httpServer.listen(PORT);
    }
}
