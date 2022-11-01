"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Server = void 0;
const uWebSockets_js_1 = __importDefault(require("uWebSockets.js"));
const express_1 = __importDefault(require("express"));
const node_http_1 = __importDefault(require("node:http"));
const node_https_1 = __importDefault(require("node:https"));
const node_fs_1 = __importDefault(require("node:fs"));
const Data_1 = require("./Data");
const PORT = process.env.PORT || 8443;
const SSL = process.env.SSL || 'false';
const SSL_CERT_PATH = process.env.SSL_KEY_PATH || 'ssl/cert.pem';
const SSL_KEY_PATH = process.env.SSL_KEY_PATH || 'ssl/key.pem';
let cert, key;
if (SSL == 'true') {
    try {
        cert = node_fs_1.default.readFileSync(SSL_CERT_PATH);
        key = node_fs_1.default.readFileSync(SSL_CERT_PATH);
    }
    catch (err) {
        console.error('Could not read SSL certificatekey:', err);
        process.exit(1);
    }
}
class Server {
    static start() {
        return __awaiter(this, void 0, void 0, function* () {
            Data_1.Data.start();
            this.app = (0, express_1.default)();
            if (Boolean(SSL)) {
                this.httpServer = node_https_1.default.createServer({
                    cert, key
                }, this.app);
                this.wss = uWebSockets_js_1.default.SSLApp({
                    key_file_name: 'ssl/key.pem',
                    cert_file_name: 'ssl/cert.pem'
                });
            }
            else {
                this.httpServer = node_http_1.default.createServer({}, this.app);
                this.wss = uWebSockets_js_1.default.App();
            }
            this.listen();
        });
    }
    static listen() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isListening)
                return;
            this.httpServer.listen(PORT);
        });
    }
}
exports.Server = Server;
Server.isListening = false;
