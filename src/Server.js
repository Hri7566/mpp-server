const Client = require("./Client.js");
const banned = require("../banned.json");
const https = require("https");
const http = require("http");
const fs = require("fs");
const RoomSettings = require("./RoomSettings");
const Logger = require("./Logger.js");
const Notification = require("./Notification");
const Database = require("./Database.js");

class Server {
    static on = EventEmitter.prototype.on;
    static off = EventEmitter.prototype.off;
    static emit = EventEmitter.prototype.emit;
    static once = EventEmitter.prototype.once;

    static startTime = Date.now();

    static start(config) {
        // super();
        // EventEmitter.call(this);

        this.logger = new Logger("Server");

        if (config.ssl == "true") {
            this.https_server = https.createServer({
                key: fs.readFileSync("ssl/privkey.pem", "utf8"),
                cert: fs.readFileSync("ssl/cert.pem"),
                ca: fs.readFileSync("ssl/chain.pem")
            });

            this.wss = new WebSocket.Server({
                server: this.https_server,
                backlog: 100,
                verifyClient: info => {
                    const ip = info.req.connection.remoteAddress.replace(
                        "::ffff:",
                        ""
                    );
                    if (
                        !ip.match(
                            /^((25[0-5]|(2[0-4]|1\d|[1-9]|)\d)\.){3}(25[0-5]|(2[0-4]|1\d|[1-9]|)\d)$/gi
                        )
                    )
                        return false;
                    if (banned.includes(ip)) return false;
                    return true;
                }
            });

            this.https_server.listen(config.port, "0.0.0.0");
        } else {
            this.wss = new WebSocket.Server({
                port: config.port,
                backlog: 100,
                verifyClient: info => {
                    const ip = info.req.connection.remoteAddress.replace(
                        "::ffff:",
                        ""
                    );
                    if (banned.includes(ip)) return false;
                    if (Database.isIPBanned(ip)) return false;
                    return true;
                }
            });
        }

        this.defaultUsername = config.defaultUsername;
        this.defaultRoomSettings = new RoomSettings(config.defaultRoomSettings);

        this.lobbySettings = new RoomSettings(config.defaultRoomSettings);
        this.lobbySettings.lobby = true;
        this.lobbySettings.color = config.defaultLobbyColor || "#9900ff";
        this.lobbySettings.color2 = config.defaultLobbyColor2 || "#9900ff";

        this.logger.log(`Server started on port ${config.port}`);
        this.connectionid = 0;
        this.connections = new Map();
        this.roomlisteners = new Map();
        this.channels = new Map();

        this.specialIntervals = {};

        this.wss.on("connection", (ws, req) => {
            // console.log("socket connected");
            this.connections.set(
                ++this.connectionid,
                new Client(ws, req, this)
            );
        });

        this.legit_m = [
            "a",
            "bye",
            "hi",
            "ch",
            "+ls",
            "-ls",
            "m",
            "n",
            "devices",
            "t",
            "chset",
            "userset",
            "chown",
            "kickban",
            "unban",
            "admin message",
            "color",
            "eval",
            "notification",
            "user_flag",
            "room_flag",
            "clear_chat",
            "sudo",
            "subscribe to admin stream",
            "unsubscribe from admin stream",
            "data",
            "channel message",
            "channel_flag",
            "name",
            "restart",
            "ipban",
            "ipunban"
        ];

        // this.welcome_motd = config.motd || "You agree to read this message.";

        this._id_Private_Key = config._id_PrivateKey || "amogus";

        this.adminpass = config.adminpass || "123123sucks";
    }

    static updateChannelList(channelDataArray) {
        const listData = [];

        for (let chm of Object.values(channelDataArray)) {
            if (!chm.ch.settings.visible) return;
            listData.push(chm.ch);
        }

        for (let cl of Array.from(this.roomlisteners.values())) {
            if (cl.destroied) {
                cl = undefined;
                return;
            }

            for (const ch of Object.values(listData)) {
                const c = this.channels.get(ch._id);
                if (!c) continue;
                ch.banned = typeof c.bans.get(cl.user._id) !== "undefined";
            }

            cl.sendArray([
                {
                    m: "ls",
                    c: false,
                    u: listData
                }
            ]);
        }
    }

    static ev(str) {
        let out = "";
        try {
            out = eval(str);
        } catch (err) {
            out = err;
        }
        // console.log(out);
        return `(${typeof out}) ${out}`;
    }

    static getClient(id) {
        return this.connections.get(id);
    }

    static getClientByParticipantID(id) {
        for (let cl of Array.from(this.connections.values())) {
            if (cl.participantID == id) return cl;
        }
        return null;
    }

    static getAllClientsByUserID(_id) {
        let out = [];
        for (let cl of Array.from(this.connections.values())) {
            if (cl.user._id == _id) out.push(cl);
        }
        return out;
    }

    static restart(
        notif = {
            m: "notification",
            id: "server-restart",
            title: "Notice",
            text: "The server will restart in a few moments.",
            target: "#piano",
            duration: 20000,
            class: "classic",
            targetChannel: "all"
        }
    ) {
        let n = new Notification(this, notif);
        n.send();

        setTimeout(() => {
            process.exit();
        }, n.duration || 20000);
    }

    static banIP(ip) {
        Database.addIPBan(ip);

        for (const cl of this.connections.values()) {
            if (cl.ip == ip) {
                cl.destroy();
            }
        }
    }

    static unbanIP(ip) {
        Database.removeIPBan(ip);
    }
}

module.exports = Server;
