const Channel = require("./Channel.js");
const Quota = require("./Quota.js");
const quotas = require("../Quotas");
const { RateLimit, RateLimitChain } = require("./Ratelimit.js");
const User = require("./User.js");
const Database = require("./Database.js");
const { EventEmitter } = require("events");

class Client extends EventEmitter {
    /**
     * Server-side client representation
     * @param {*} ws WebSocket object
     * @param {*} req WebSocket request
     * @param {*} server Server
     */
    constructor(ws, req, server) {
        super();
        EventEmitter.call(this);
        this.connectionid = server.connectionid;
        this.server = server;
        this.participantId;
        this.channel;
        this.isSubscribedToAdminStream = false;
        this.adminStreamInterval;

        this.staticQuotas = {
            room: new RateLimit(quotas.room.time)
        };

        this.quotas = {};
        this.ws = ws;
        this.req = req;
        this.ip = req.connection.remoteAddress.replace("::ffff:", "");
        this.hidden = false;

        Database.getUserData(this, server).then(data => {
            this.user = new User(this, data);
            this.destroied = false;
            this.bindEventListeners();
            require("./Message.js")(this);
        });
    }

    /**
     * Check if user is connected
     * @returns boolean
     */
    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    /**
     * Check if user is connecting
     * @returns boolean
     */
    isConnecting() {
        return this.ws && this.ws.readyState === WebSocket.CONNECTING;
    }

    /**
     * Move user to channel
     * @param {string} _id User ID
     * @param {*} settings Settings object
     * @returns undefined
     */
    setChannel(_id, settings) {
        if (this.channel && this.channel._id == _id) return;
        if (this.server.channels.get(_id)) {
            let ch = this.server.channels.get(_id, settings);
            let userbanned = ch.bans.get(this.user._id);

            if (
                userbanned &&
                Date.now() - userbanned.bannedtime >= userbanned.msbanned
            ) {
                ch.bans.delete(userbanned.user._id);
                userbanned = undefined;
            }

            if (userbanned) {
                new Notification(this.server, {
                    targetUser: this.participantId,
                    targetChannel: all,
                    title: "Notice",
                    text: `Currently banned from "${_id}" for ${Math.ceil(
                        Math.floor(
                            (userbanned.msbanned -
                                (Date.now() - userbanned.bannedtime)) /
                                1000
                        ) / 60
                    )} minutes.`,
                    duration: 7000,
                    id: "",
                    target: "#room",
                    class: "short",
                    cl: this
                }).send();
                this.setChannel(Channel.banChannel, settings);
                return;
            }

            let channel = this.channel;
            if (channel) this.channel.emit("bye", this);
            if (channel) this.channel.updateCh(this);

            this.channel = this.server.channels.get(_id);
            this.channel.join(this);
        } else {
            let room = new Channel(this.server, _id, settings, this);
            this.server.channels.set(_id, room);
            if (this.channel) this.channel.emit("bye", this);
            this.channel = this.server.channels.get(_id);
            this.channel.join(this, settings);
        }
    }

    /**
     * Send data to client
     * @param {any[]} arr Array of messages
     */
    sendArray(arr) {
        if (this.isConnected()) {
            //console.log(`SEND: `, JSON.colorStringify(arr));
            this.ws.send(JSON.stringify(arr));
        }
    }

    /**
     * Set username in database
     * @param {string} name Username
     * @param {boolean} admin Is admin?
     * @returns undefined
     */
    userset(name, admin) {
        if (name.length > 40 && !admin) return;

        if (this.quotas.userset) {
            if (!this.quotas.userset.attempt()) return;
        }

        if (!this.user.hasFlag("freeze_name", true) || admin) {
            this.user.name = name;

            if (!this.user.hasFlag("freeze_name", true)) {
                Database.getUserData(this, this.server).then(usr => {
                    Database.updateUser(this.user._id, this.user);

                    this.server.channels.forEach(channel => {
                        channel.updateParticipant(this.user._id, {
                            name: name
                        });
                    });
                });
            }
        }
    }

    /**
     * Set rate limits
     */
    initParticipantQuotas() {
        this.quotas = {
            //"chat": new Quota(Quota.PARAMS_A_NORMAL),
            chat: {
                lobby: new RateLimitChain(
                    quotas.chat.lobby.amount,
                    quotas.chat.lobby.time
                ),
                normal: new RateLimitChain(
                    quotas.chat.normal.amount,
                    quotas.chat.normal.time
                ),
                insane: new RateLimitChain(
                    quotas.chat.insane.amount,
                    quotas.chat.insane.time
                )
            },
            cursor: new RateLimitChain(
                quotas.cursor.amount,
                quotas.cursor.time
            ),
            chown: new RateLimitChain(quotas.chown.amount, quotas.chown.time),
            userset: new RateLimitChain(
                quotas.userset.amount,
                quotas.userset.time
            ),
            kickban: new RateLimitChain(
                quotas.kickban.amount,
                quotas.kickban.time
            ),
            // note: new Quota(Quota.PARAMS_LOBBY),
            note: new RateLimitChain(5, 5000),
            chset: new Quota(Quota.PARAMS_USED_A_LOT),
            "+ls": new Quota(Quota.PARAMS_USED_A_LOT),
            "-ls": new Quota(Quota.PARAMS_USED_A_LOT)
        };
    }

    /**
     * Stop the client
     */
    destroy() {
        if (this.user) {
            let lastClient = true;

            for (const cl of this.server.connections.values()) {
                if (cl.user) {
                    if (cl.user._id == this.user._id) {
                        lastClient = false;
                        break;
                    }
                }
            }

            if (lastClient) this.user.stopFlagEvents();
        }

        this.ws.close();

        if (this.channel) {
            this.channel.emit("bye", this);
        }
        this.user;
        this.participantId;
        this.channel;
        this.server.roomlisteners.delete(this.connectionid);
        this.connectionid;
        this.server.connections.delete(this.connectionid);
        this.destroied = true;
    }

    /**
     * Internal
     */
    bindEventListeners() {
        this.ws.on("message", (evt, admin) => {
            try {
                if (typeof evt !== "string") evt = evt.toJSON();
                let transmission = JSON.parse(evt);
                for (let msg of transmission) {
                    if (typeof msg !== "object" || msg == null || msg == NaN)
                        return;
                    if (!msg.hasOwnProperty("m")) return;
                    if (!this.server.legit_m.includes(msg.m)) return;
                    this.emit(msg.m, msg, !!admin);
                    //console.log(`RECIEVE: `, JSON.colorStringify(msg));
                }
            } catch (e) {
                console.log(e);
                // this.destroy();
            }
        });

        this.ws.on("close", () => {
            if (!this.destroied) {
                this.destroy();
            }
        });

        this.ws.addEventListener("error", err => {
            console.error(err);
            if (!this.destroied) {
                this.destroy();
            }
        });
    }

    /**
     * Send admin data bus message
     */
    sendAdminData() {
        let data = {};
        data.m = "data";

        let channels = [];
        this.server.channels.forEach(ch => {
            let ppl = [];
            const chdata = ch.fetchChannelData();

            for (let p of chdata.ppl) {
                ppl.push({
                    user: p
                });
            }

            channels.push({
                chat: ch.chatmsgs.slice(-1 * 32),
                participants: ppl
            });
        });

        let users = [];
        let clients = [];
        this.server.connections.forEach(cl => {
            if (!cl.user) return;
            let c = {
                ip: cl.ip,
                participantId: cl.participantId,
                userId: cl.user._id
            };
            clients.push(c);
            let u = {
                p: {
                    _id: cl.user._id,
                    name: cl.user.name,
                    color: cl.user.color,
                    flags: cl.user.flags
                    // inventory: cl.user.inventory
                },
                id: cl.participantId
            };

            users.push(u);
        });

        data.channelManager = {
            loggingChannel: Channel.loggingChannel,
            loggerParticipant: Channel.loggerParticipant,
            channels
        };

        data.clientManager = {
            users,
            clients
        };

        data.uptime = Date.now() - this.server.startTime;
        data.config = this.server.config;
        if (this.user) {
            data.p = {
                _id: this.user._id,
                name: this.user.name,
                color: this.user.color,
                flags: this.user.flags
                // inventory: this.user.inventory
            };
        }

        this.sendArray([data]);
    }

    /**
     *
     * @param {Channel} ch
     * @param {Client} cl If this is present, only this client's user data will be sent(?)
     */
    sendChannelUpdate(ch, cl) {
        let msg = ch.fetchChannelData(this, cl);
        this.sendArray([msg]);
    }
}

module.exports = Client;
