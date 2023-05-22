const createKeccakHash = require("keccak");
const Crown = require("./Crown.js");
const Database = require("../Database.js");
const Logger = require("../Logger.js");
const Quota = require("../Quota.js");
const RoomSettings = require("../RoomSettings.js");
const ftc = require("fancy-text-converter");
const Notification = require("../Notification.js");
const Color = require("../Color.js");
const { getTimeColor } = require("../ColorEncoder.js");
const { InternalBot } = require("../InternalBot/index.js");

function ansiRegex({ onlyFirst = false } = {}) {
    const pattern = [
        "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
        "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"
    ].join("|");

    return new RegExp(pattern, onlyFirst ? undefined : "g");
}

const LOGGER_PARTICIPANT = {
    name: "Logger",
    color: "#72f1b8",
    _id: "logger",
    id: "logger"
};

const SERVER_PARTICIPANT = {
    name: "mpp",
    color: "#ffffff",
    _id: "0",
    id: "0"
};

const LOGGING_CHANNEL = "lolwutsecretloggingchannel";
const BAN_CHANNEL = "test/awkward";

class Channel extends EventEmitter {
    static loggingChannel = LOGGING_CHANNEL;
    static loggerParticipant = LOGGER_PARTICIPANT;
    static serverParticipant = SERVER_PARTICIPANT;
    static banChannel = BAN_CHANNEL;

    constructor(server, _id, settings, cl) {
        super();
        this.logger = new Logger(`Room - ${_id}`);
        this._id = _id;
        this.server = server;
        this.crown;
        this.crowndropped = false;

        if (this.isLobby(this._id)) {
            this.settings = new RoomSettings(this.server.lobbySettings);
            // this.settings.lobby = true;
            // this.settings.color = this.server.lobbySettings.color;
            // this.settings.color2 = this.server.lobbySettings.color2;
        } else {
            this.settings = new RoomSettings(settings, "user");
        }

        this.chatmsgs = [];
        this.ppl = new Map();
        this.connections = [];
        this.bindEventListeners();
        this.server.channels.set(_id, this);
        this.bans = new Map();
        this.flags = {};
        this.destroyed = false;

        this.logger.log("Created");

        if (this._id == LOGGING_CHANNEL) {
            if (cl.user.hasFlag("admin")) {
                delete this.crown;

                Logger.buffer.forEach(str => {
                    this.chatmsgs.push({
                        m: "a",
                        p: LOGGER_PARTICIPANT,
                        a: str.replace(ansiRegex(), "")
                    });
                });

                Logger.on("buffer update", str => {
                    this.chatmsgs.push({
                        m: "a",
                        p: LOGGER_PARTICIPANT,
                        a: str.replace(ansiRegex(), "")
                    });

                    this.sendChatArray();
                });

                this.emit("update");

                let c = new Color(LOGGER_PARTICIPANT.color);
                c.add(-0x40, -0x40, -0x40);

                let c2 = new Color(c.toHexa());
                c2.add(-0x40, -0x40, -0x40);

                this.settings = RoomSettings.changeSettings(
                    {
                        color: c.toHexa(),
                        color2: c2.toHexa(),
                        chat: true,
                        crownsolo: true,
                        lobby: false,
                        owner_id: LOGGER_PARTICIPANT._id
                    },
                    true
                );
            } else {
                cl.setChannel("test/awkward");
            }
        } else {
            Database.getRoomSettings(this._id, (err, set) => {
                if (err) {
                    return;
                }

                this.settings = RoomSettings.changeSettings(
                    this.settings,
                    true
                );
                this.chatmsgs = set.chat;
                this.sendChatArray();
                this.setData();
            });
        }

        if (this.isLobby(this._id)) {
            this.colorInterval = setInterval(() => {
                this.setDefaultLobbyColorBasedOnDate();
            }, 5000);
            this.setDefaultLobbyColorBasedOnDate();
        }
    }

    setChatArray(arr) {
        this.chatmsgs = arr || [];
        this.sendArray([
            {
                m: "c",
                c: this.chatmsgs.slice(-1 * 32)
            }
        ]);
        this.setData();
    }

    sendChatArray() {
        this.connections.forEach(cl => {
            cl.sendArray([
                {
                    m: "c",
                    c: this.chatmsgs.slice(-1 * 32)
                }
            ]);
        });
    }

    setDefaultLobbyColorBasedOnDate() {
        let col = getTimeColor();
        let col2 = new Color(col.r - 0x40, col.g - 0x40, col.b - 0x40);

        if (!this.settings) {
            this.settings = new RoomSettings(this.server.lobbySettings);
        }

        this.settings.changeSettings({
            color: col.toHexa(),
            color2: col.toHexa()
        });

        for (let key in this.settings) {
            this.server.lobbySettings[key] = this.settings[key];
        }

        this.emit("update");
    }

    join(cl, set) {
        //this stuff is complicated
        let otheruser = this.connections.find(a => a.user._id == cl.user._id);
        if (!otheruser) {
            // we don't exist yet
            // create id hash
            let participantId = createKeccakHash("keccak256")
                .update(Math.random().toString() + cl.ip)
                .digest("hex")
                .substr(0, 24);

            // set id
            cl.user.id = participantId;
            cl.participantId = participantId;

            // init quotas (TODO pass type of room in?)
            cl.initParticipantQuotas();

            // no users / already had crown? give crown
            if (
                (this.connections.length == 0 &&
                    Array.from(this.ppl.values()).length == 0 &&
                    this.isLobby(this._id) == false) ||
                (this.crown &&
                    (this.crown.userId == cl.user._id ||
                        this.settings["owner_id"] == cl.user._id))
            ) {
                // user owns the room
                // we need to switch the crown to them
                //cl.quotas.a.setParams(Quota.PARAMS_A_CROWNED);
                this.emit("add crown", {
                    participantId: cl.participantId,
                    userId: cl.user._id
                });

                this.crowndropped = false;
                // this.settings = new RoomSettings(set, 'user');
            } else {
                //cl.quotas.a.setParams(Quota.PARAMS_A_NORMAL);

                if (this.isLobby(this._id) && this.settings.lobby !== true) {
                    // fix lobby setting
                    this.settings.changeSettings({ lobby: true });
                    // this.settings.visible = true;
                    // this.settings.crownsolo = false;
                    // this.settings.lobby = true;
                    // this.settings.color = this.server.lobbySettings.color;
                    // this.settings.color2 = this.server.lobbySettings.color2;
                } else {
                    if (!this.isLobby) {
                        if (typeof set == "undefined") {
                            if (typeof this.settings == "undefined") {
                                this.settings = new RoomSettings(
                                    this.server.defaultRoomSettings,
                                    "user"
                                );
                            } else {
                                this.settings = new RoomSettings(
                                    cl.channel.settings,
                                    "user"
                                );
                            }
                        } else {
                            this.settings = new RoomSettings(set, "user");
                        }
                    }
                }
            }

            this.ppl.set(participantId, cl);

            this.connections.push(cl);

            cl.sendArray([
                {
                    m: "c",
                    c: this.chatmsgs.slice(-1 * 32)
                }
            ]);

            // this.updateCh(cl, this.settings);

            if (!cl.user.hasFlag("hidden", true)) {
                this.sendArray(
                    [
                        {
                            m: "p",
                            _id: cl.user._id,
                            name: cl.user.name,
                            color: cl.user.color,
                            id: cl.participantId,
                            x: this.ppl.get(cl.participantId).x || 200,
                            y: this.ppl.get(cl.participantId).y || 100
                        }
                    ],
                    cl,
                    false
                );
            }

            this.updateCh(cl, this.settings);
        } else {
            cl.user.id = otheruser.participantId;
            cl.participantId = otheruser.participantId;
            cl.quotas = otheruser.quotas;
            this.connections.push(cl);
            cl.sendArray([
                {
                    m: "c",
                    c: this.chatmsgs.slice(-1 * 32)
                }
            ]);
            this.updateCh(cl, this.settings);
        }
    }

    remove(p) {
        // remove user
        if (!p) return;
        if (!p.user) return;
        let otheruser = this.connections.filter(a => a.user._id == p.user._id);
        if (!(otheruser.length > 1)) {
            this.ppl.delete(p.participantId);
            this.connections.splice(
                this.connections.findIndex(
                    a => a.connectionid == p.connectionid
                ),
                1
            );
            this.sendArray(
                [
                    {
                        m: "bye",
                        p: p.participantId
                    }
                ],
                p,
                false
            );
            if (this.crown)
                if (this.crown.userId == p.user._id && !this.crowndropped) {
                    this.chown();
                }
            this.updateCh();
        } else {
            this.connections.splice(
                this.connections.findIndex(
                    a => a.connectionid == p.connectionid
                ),
                1
            );
        }
    }

    updateCh(cl, set) {
        //update channel for all people in channel
        if (Array.from(this.ppl.values()).length <= 0) {
            setTimeout(() => {
                this.destroy();
            }, 3000);
            return;
        }

        this.connections.forEach(usr => {
            let u = this.fetchChannelData(usr, cl);
            this.server.connections.get(usr.connectionid).sendArray([u]);
        });

        this.server.updateChannelList([this.fetchChannelData()]);
    }

    updateParticipant(pid, options) {
        let p;

        Array.from(this.ppl).map(rpg => {
            if (rpg[1].user._id == pid) p = rpg[1];
        });

        if (typeof p == "undefined") return;

        options.name ? (p.user.name = options.name) : {};
        options._id ? (p.user._id = options._id) : {};
        options.color ? (p.user.color = options.color) : {};

        this.connections
            .filter(ofo => ofo.participantId == p.participantId)
            .forEach(usr => {
                options.name ? (usr.user.name = options.name) : {};
                options._id ? (usr.user._id = options._id) : {};
                options.color ? (usr.user.color = options.color) : {};
            });

        if (!p.hidden) {
            this.sendArray([
                {
                    color: p.user.color,
                    id: p.participantId,
                    m: "p",
                    name: p.user.name,
                    x: p.x || 200,
                    y: p.y || 100,
                    _id: p.user._id
                }
            ]);
        }
    }

    destroy() {
        //destroy room
        if (this.destroyed) return;
        if (this.ppl.size > 0) return;
        if (this._id == "lobby") return;
        this.destroyed = true;
        this._id;
        this.logger.log(`Deleted room ${this._id}`);
        this.settings = undefined;
        this.ppl;
        this.connnections;
        this.chatmsgs;
        this.server.channels.delete(this._id);
    }

    sendArray(arr, not, onlythisparticipant) {
        this.connections.forEach(usr => {
            if (
                !not ||
                (usr.participantId != not.participantId &&
                    !onlythisparticipant) ||
                (usr.connectionid != not.connectionid && onlythisparticipant)
            ) {
                try {
                    let cl = this.server.connections.get(usr.connectionid);
                    if (!cl) return;
                    this.server.connections
                        .get(usr.connectionid)
                        .sendArray(arr);
                } catch (e) {
                    this.logger.error(e);
                }
            }
        });
    }

    fetchChannelData(usr, cl) {
        let chppl = [];

        [...this.ppl.values()].forEach(c => {
            if (cl) {
                if (c.hidden == true && c.user._id !== cl.user._id) {
                    // client is hidden and we are that client
                    return;
                } else if (c.user._id == cl.user._id) {
                    // let u = {
                    //     _id: c.user._id,
                    //     name: c.user.name + ' [HIDDEN]',
                    //     color: c.user.color,
                    //     id: c.participantId
                    // }
                    // chppl.push(u);
                }
            }
            let u = {
                _id: c.user._id,
                name: c.user.name,
                color: c.user.color,
                id: c.participantId
            };
            chppl.push(u);
        });

        let data = {
            m: "ch",
            p: "ofo",
            ch: {
                count: chppl.length,
                crown: this.crown,
                settings: this.settings,
                _id: this._id
            },
            ppl: chppl
        };

        if (cl) {
            if (usr.connectionid == cl.connectionid) {
                data.p = cl.participantId;
            } else {
                delete data.p;
            }
        } else {
            delete data.p;
        }

        if (data.ch.crown == null) {
            delete data.ch.crown;
        } else {
        }

        return data;
    }

    verifyColor(strColor) {
        var test2 = /^#[0-9A-F]{6}$/i.test(strColor);
        if (test2 == true) {
            return strColor;
        } else {
            return false;
        }
    }

    isLobby(_id) {
        if (_id.startsWith("lobby")) {
            if (_id == "lobby") {
                return true;
            }

            let lobbynum = _id.split("lobby")[1];
            if (!(parseInt(lobbynum).toString() == lobbynum)) return false;

            for (let i in lobbynum) {
                if (parseInt(lobbynum[i]) >= 0) {
                    if (parseInt(i) + 1 == lobbynum.length) return true;
                } else {
                    return false;
                }
            }
        } else if (
            _id.startsWith("test/") ||
            _id.toLowerCase().includes("grant")
        ) {
            if (_id == "test/") {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
    }

    chown(id) {
        let prsn = this.ppl.get(id);
        if (prsn) {
            this.crown = new Crown(id, prsn.user._id);
            this.crowndropped = false;
        } else {
            if (this.crown) {
                this.crown = new Crown(id, this.crown.userId);
                this.crowndropped = true;
            }
        }

        this.updateCh();
    }

    setCoords(p, x, y) {
        if (p.participantId && this.ppl.get(p.participantId)) {
            x ? (this.ppl.get(p.participantId).x = x) : {};
            y ? (this.ppl.get(p.participantId).y = y) : {};
            this.sendArray(
                [
                    {
                        m: "m",
                        id: p.participantId,
                        x: this.ppl.get(p.participantId).x,
                        y: this.ppl.get(p.participantId).y
                    }
                ],
                p,
                false
            );
        }
    }

    chat(p, msg) {
        if (msg.message.length > 512) return;

        if (p.participantId == 0) {
            let message = {};

            message.m = "a";
            message.t = Date.now();
            message.a = msg.message;

            if (message.a.length > 0 && message.a.length <= 512) {
                message.p = {
                    color: "#ffffff",
                    id: "0",
                    name: "mpp",
                    _id: "0"
                };

                this.sendArray([message]);

                this.chatmsgs.push(message);
                this.setData();
                return;
            }
        }

        let filter = ["AMIGHTYWIND", "CHECKLYHQ"];
        let regexp = new RegExp("\\b(" + filter.join("|") + ")\\b", "i");
        if (regexp.test(msg.message.split(" ").join(""))) return;

        let prsn = this.ppl.get(p.participantId);
        if (!prsn) return;
        let message = {};
        message.m = "a";
        message.a = msg.message;

        if (prsn.user.hasFlag("chat_curse_1")) {
            if (prsn.user.flags["chat_curse_1"] != false)
                message.a = message.a
                    .split(/[aeiou]/)
                    .join("o")
                    .split(/[AEIOU]/)
                    .join("O");
        }

        if (prsn.user.hasFlag("chat_curse_2")) {
        }

        message.p = {
            color: p.user.color,
            id: p.participantId,
            name: p.user.name,
            _id: p.user._id
        };

        message.t = Date.now();

        this.sendArray([message]);
        this.chatmsgs.push(message);
        this.setData();

        InternalBot.emit("receive message", message, prsn, this);
    }

    adminChat(str) {
        this.chat(
            {
                participantId: 0
            },
            {
                message: str
            }
        );
    }

    hasUser(id) {
        // return this.ppl.has(id);
        for (const p of this.ppl.values()) {
            if (p.id == id) return true;
        }
    }

    playNote(cl, note) {
        if (cl.user.hasFlag("mute", true)) {
            return;
        }

        if (cl.user.hasFlag("mute")) {
            if (Array.isArray(cl.user.flags["mute"])) {
                if (cl.user.flags["mute"].includes(this._id)) return;
            }
        }

        let vol;

        if (cl.user.hasFlag("volume")) {
            vol = Math.round(cl.user.flags["volume"]) / 100;
        }

        if (typeof vol == "number") {
            for (let no of note.n) {
                if (no.v) {
                    if (vol == 0) {
                        no.v = vol;
                    } else {
                        no.v *= vol;
                    }
                }
            }
        }

        this.sendArray(
            [
                {
                    m: "n",
                    n: note.n,
                    p: cl.participantId,
                    t: note.t
                }
            ],
            cl,
            true
        );
    }

    kickban(_id, ms) {
        ms = parseInt(ms);

        if (ms >= 1000 * 60 * 60) return;
        if (ms < 0) return;

        ms = Math.round(ms / 1000) * 1000;

        let user = this.connections.find(usr => usr.user._id == _id);
        if (!user) return;
        let asd = true;
        let pthatbanned = this.ppl.get(this.crown.participantId);

        this.connections
            .filter(usr => usr.participantId == user.participantId)
            .forEach(u => {
                user.bantime = Math.floor(Math.floor(ms / 1000) / 60);
                user.bannedtime = Date.now();
                user.msbanned = ms;

                this.bans.set(user.user._id, user);

                //if (this.crown && (this.crown.userId)) {
                u.setChannel(Channel.banChannel, {});

                if (asd)
                    new Notification(this.server, {
                        id: "",
                        title: "Notice",
                        text: `Banned from "${this._id}" for ${Math.floor(
                            Math.floor(ms / 1000) / 60
                        )} minutes.`,
                        duration: 7000,
                        target: "#room",
                        class: "short",
                        targetUser: user.participantId,
                        targetChannel: "all",
                        cl: user
                    }).send();
                new Notification(this.server, {
                    id: "",
                    title: "Notice",
                    text: `Banned from "${this._id}" for ${Math.floor(
                        Math.floor(ms / 1000) / 60
                    )} minutes.`,
                    duration: 7000,
                    target: "#room",
                    class: "short",
                    targetUser: user.participantId,
                    targetChannel: "all",
                    cl: user
                }).send();
                if (asd)
                    new Notification(this.server, {
                        id: "",
                        class: "short",
                        target: "#room",
                        title: "Notice",
                        text: `${pthatbanned.user.name} banned ${
                            user.user.name
                        } from the channel for ${Math.floor(
                            Math.floor(ms / 1000) / 60
                        )} minutes.`,
                        duration: 7000,
                        targetChannel: "room",
                        cl: pthatbanned
                    }).send();
                if (this.crown && this.crown.userId == _id) {
                    new Notification(this.server, {
                        id: "",
                        class: "short",
                        target: "#room",
                        title: "Certificate of Award",
                        text: `Let it be known that ${user.user.name} kickbanned him/her self.`,
                        targetChannel: "room",
                        duration: 7000,
                        cl: pthatbanned
                    }).send();
                }
                //}
            });
    }

    unban(_id) {
        let ban = this.bans.get(_id);
        if (!ban) return;
        if (ban.bantime) {
            delete ban.bantime;
        }

        if (ban.bannedtime) {
            delete ban.bannedtime;
        }

        this.bans.delete(ban.user._id);
    }

    bindEventListeners() {
        this.on("bye", participant => {
            this.remove(participant);
        });

        this.on("m", msg => {
            let p = this.ppl.get(msg.p);
            if (!p) return;
            this.setCoords(p, msg.x, msg.y);
        });

        this.on("a", (participant, msg) => {
            this.chat(participant, msg);
        });

        this.on("update", (cl, set) => {
            this.updateCh(cl, set);
        });

        this.on("remove crown", () => {
            this.crown = undefined;
            delete this.crown;
            this.emit("update");
        });

        this.on("add crown", msg => {
            this.crown = new Crown(msg.participantId, msg.userId);
            this.emit("update");
        });

        this.on("kickban", msg => {
            if (!msg._id) return;
            if (!msg.ms) msg.ms = 30 * 60 * 1000;
            this.kickban(msg._id, msg.ms);
        });
    }

    verifySet(_id, msg) {
        if (typeof msg.set !== "object") {
            msg.set = {
                visible: true,
                color: this.server.defaultSettings.color,
                chat: true,
                crownsolo: false
            };
        }

        msg.set = RoomSettings.changeSettings(msg.set);

        if (typeof msg.set.lobby !== "undefined") {
            if (msg.set.lobby == true) {
                if (!this.isLobby(_id)) delete msg.set.lobby;
            } else {
                if (this.isLobby(_id)) {
                    msg.set = this.server.lobbySettings;
                }
            }
        }
    }

    setData() {
        Database.setRoomSettings(this._id, this.settings, this.chatmsgs);
    }

    hasFlag(flag, val) {
        if (!val) return this.flags.hasOwnProperty(flag);
        return this.flags.hasOwnProperty(flag) && this.flags[flag] == val;
    }
}

module.exports = Channel;
