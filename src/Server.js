const Client = require("./Client.js");
const banned = require('../banned.json');
const https = require("https");
const http = require("http");
const fs = require('fs');
const RoomSettings = require('./RoomSettings');

class Server extends EventEmitter {
    constructor(config) {
        super();
        EventEmitter.call(this);
        
        if (config.ssl == true) {
            this.https_server = https.createServer({
                key: fs.readFileSync('ssl/privkey.pem', 'utf8'),
                cert: fs.readFileSync('ssl/cert.pem'),
                ca: fs.readFileSync('ssl/chain.pem')
            });

            this.wss = new WebSocket.Server({
                server: this.https_server,
                backlog: 100,
                verifyClient: (info) => {
                    if (banned.includes((info.req.connection.remoteAddress).replace("::ffff:", ""))) return false;
                    return true;
                }
            });
            
            this.https_server.listen(config.port);
        } else {
            this.wss = new WebSocket.Server({
                port: 8443,
                backlog: 100,
                verifyClient: (info) => {
                    if (banned.includes((info.req.connection.remoteAddress).replace("::ffff:", ""))) return false;
                    return true;
                }
            });
        }

        this.defaultUsername = "Anonymous";
        this.defaultRoomSettings = new RoomSettings(config.defaultRoomSettings);

        this.lobbySettings = new RoomSettings(config.defaultRoomSettings);
        this.lobbySettings.lobby = true;
        this.lobbySettings.color = config.defaultLobbyColor || "#9900ff";
        this.lobbySettings.color2 = config.defaultLobbyColor2 || "#9900ff";

        console.log(`Server started on port ${config.port}`);
        this.connectionid = 0;
        this.connections = new Map();
        this.roomlisteners = new Map();
        this.rooms = new Map();

        this.wss.on('connection', (ws, req) => {
            this.connections.set(++this.connectionid, new Client(ws, req, this));
        });

        this.legit_m = ["a", "bye", "hi", "ch", "+ls", "-ls", "m", "n", "devices", "t", "chset", "userset", "chown", "kickban", "admin message", "color", "eval", "notification"]
        this.welcome_motd = config.motd || "You agree to read this message.";

        this._id_Private_Key = config._id_PrivateKey || "boppity";

        this.adminpass = config.adminpass || "Bop It";
    }

    updateRoom(data) {
        if (!data.ch.settings.visible) return;

        for (let cl of Array.from(this.roomlisteners.values())) {
            cl.sendArray([{
                "m": "ls",
                "c": false,
                "u": [data.ch]
            }]);
        }
    }

    ev(str) {
        let out = "";
        try {
            out = eval(str);
        } catch(err) {
            out = err;
        }
        console.log(out);
    }
}

module.exports = Server;
