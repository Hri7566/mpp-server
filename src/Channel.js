const createKeccakHash = require('keccak');
const Crown = require('./Crown.js');
const Database = require('./Database.js');
const Logger = require('./Logger.js');
const Quota = require("./Quota.js");
const RoomSettings = require('./RoomSettings.js');
const ftc = require('fancy-text-converter');
const Notification = require('./Notification');

class Channel extends EventEmitter {
    constructor(server, _id, settings) {
        super();
        this.logger = new Logger(`Room - ${_id}`);
        this._id = _id;
        this.server = server;
        this.crown;
        this.crowndropped = false;
        this.settings = settings;
        this.chatmsgs = [];
        this.ppl = new Map();
        this.connections = [];
        this.bindEventListeners();
        this.server.rooms.set(_id, this);
        this.bans = new Map();
        this.flags = {}
        this.destroyed = false;

        this.logger.log('Created');

        Database.getRoomSettings(this._id, (err, set) => {
            if (err) {
                return;
            }
            
            this.settings = set.settings;
            this.chatmsgs = set.chat;
            this.connections.forEach(cl => {
                cl.sendArray([{
                    m: 'c',
                    c: this.chatmsgs.slice(-1 * 32)
                }]);
            });
            this.setData();
        });
    }

    setChatArray(arr) {
        this.chatmsgs = arr || [];
        this.sendArray([{
            m: 'c',
            c: this.chatmsgs.slice(-1 * 32)
        }]);
        this.setData();
    }

    join(cl, set) { //this stuff is complicated
        let otheruser = this.connections.find((a) => a.user._id == cl.user._id)
        if (!otheruser) {
            let participantId = createKeccakHash('keccak256').update((Math.random().toString() + cl.ip)).digest('hex').substr(0, 24);

            cl.user.id = participantId;
            cl.participantId = participantId;
            cl.initParticipantQuotas();
            
            if (((this.connections.length == 0 && Array.from(this.ppl.values()).length == 0) && this.isLobby(this._id) == false) || this.crown && (this.crown.userId == cl.user._id)) { //user that created the room, give them the crown.
                //cl.quotas.a.setParams(Quota.PARAMS_A_CROWNED);
                this.crown = new Crown(cl.participantId, cl.user._id);

                this.crowndropped = false;
                this.settings = new RoomSettings(set, 'user');
            } else {
                //cl.quotas.a.setParams(Quota.PARAMS_A_NORMAL);

                if (this.isLobby(this._id)) {
                    this.settings = new RoomSettings(this.server.lobbySettings, 'user');
                    this.settings.visible = true;
                    this.settings.crownsolo = false;
                    this.settings.color = this.server.lobbySettings.color;
                    this.settings.color2 = this.server.lobbySettings.color2;
                    this.settings.lobby = true;
                } else {
                    if (typeof(set) == 'undefined') {
                        if (typeof(this.settings) == 'undefined') {
                            this.settings = new RoomSettings(this.server.defaultRoomSettings, 'user');
                        } else {
                            this.settings = new RoomSettings(cl.channel.settings, 'user');
                        }
                    } else {
                        this.settings = new RoomSettings(set, 'user');
                    }
                }
            }

            this.ppl.set(participantId, cl);

            this.connections.push(cl);

            if (!cl.hidden) {
                this.sendArray([{
                    color: this.ppl.get(cl.participantId).user.color,
                    id: this.ppl.get(cl.participantId).participantId,
                    m: "p",
                    name: this.ppl.get(cl.participantId).user.name,
                    x: this.ppl.get(cl.participantId).x || 200,
                    y: this.ppl.get(cl.participantId).y || 100,
                    _id: cl.user._id
                }], cl, false)
                cl.sendArray([{
                    m: "c",
                    c: this.chatmsgs.slice(-1 * 32)
                }]);
            }
            this.updateCh(cl, this.settings);
        } else {
            cl.user.id = otheruser.participantId;
            cl.participantId = otheruser.participantId;
            cl.quotas = otheruser.quotas;
            this.connections.push(cl);
            cl.sendArray([{
                m: "c",
                c: this.chatmsgs.slice(-1 * 32)
            }])
            this.updateCh(cl, this.settings);
        }
    }

    remove(p) { //this is complicated too
        let otheruser = this.connections.filter((a) => a.user._id == p.user._id);
        if (!(otheruser.length > 1)) {
            this.ppl.delete(p.participantId);
            this.connections.splice(this.connections.findIndex((a) => a.connectionid == p.connectionid), 1);
            this.sendArray([{
                m: "bye",
                p: p.participantId
            }], p, false);
            if (this.crown)
                if (this.crown.userId == p.user._id && !this.crowndropped) {
                    this.chown();
                }
            this.updateCh();
        } else {
            this.connections.splice(this.connections.findIndex((a) => a.connectionid == p.connectionid), 1);
        }

    }

    updateCh(cl) { //update channel for all people in channel
        if (Array.from(this.ppl.values()).length <= 0) {
            setTimeout(() => {
                this.destroy();
            }, 5000);
        }

        this.connections.forEach((usr) => {
            let u = this.fetchChannelData(usr, cl);
            this.server.connections.get(usr.connectionid).sendArray([u]);
        });

        this.server.updateRoom(this.fetchChannelData());
    }

    updateParticipant(pid, options) {
        let p;

        Array.from(this.ppl).map(rpg => {
            if (rpg[1].user._id == pid) p = rpg[1];
        });

        if (typeof(p) == 'undefined') return;

        options.name ? p.user.name = options.name : {};
        options._id ? p.user._id = options._id : {};
        options.color ? p.user.color = options.color : {};

        this.connections.filter((ofo) => ofo.participantId == p.participantId).forEach((usr) => {
            options.name ? usr.user.name = options.name : {};
            options._id ? usr.user._id = options._id : {};
            options.color ? usr.user.color = options.color : {};
        });

        if (!p.hidden) {
            this.sendArray([{
                color: p.user.color,
                id: p.participantId,
                m: "p",
                name: p.user.name,
                x: p.x || 200,
                y: p.y || 100,
                _id: p.user._id
            }]);
        }
    }
    
    destroy() { //destroy room
        if (this.destroyed) return;
        if (this.ppl.size > 0) return;
        this.destroyed = true;
        this._id;
        console.log(`Deleted room ${this._id}`);
        this.settings = undefined;
        this.ppl;
        this.connnections;
        this.chatmsgs;
        this.server.rooms.delete(this._id);
    }

    sendArray(arr, not, onlythisparticipant) {
        this.connections.forEach((usr) => {
            if (!not || (usr.participantId != not.participantId && !onlythisparticipant) || (usr.connectionid != not.connectionid && onlythisparticipant)) {
                try {
                    this.server.connections.get(usr.connectionid).sendArray(arr)
                } catch (e) {
                    console.log(e);
                }
            }
        });
    }

    fetchChannelData(usr, cl) {
        let chppl = [];

        [...this.ppl.values()].forEach(c => {
            let u = {
                _id: c.user._id,
                name: c.user.name,
                color: c.user.color,
                id: c.participantId
            }
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
        }

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
        } else if (_id.startsWith("test/") || _id.toLowerCase().includes("grant")) {
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
            this.crown = new Crown(id, this.crown.userId);
            this.crowndropped = true;
        }

        this.updateCh();
    }

    setCoords(p, x, y) {
        if (p.participantId && this.ppl.get(p.participantId)) {
            x ? this.ppl.get(p.participantId).x = x : {};
            y ? this.ppl.get(p.participantId).y = y : {};
            this.sendArray([{
                m: "m",
                id: p.participantId,
                x: this.ppl.get(p.participantId).x,
                y: this.ppl.get(p.participantId).y
            }], p, false);
        }
    }

    chat(p, msg) {
        if (msg.message.length > 512) return;
        let filter = ["AMIGHTYWIND", "CHECKLYHQ"];
        let regexp = new RegExp("\\b(" + filter.join("|") + ")\\b", "i");
        if (regexp.test(msg.message.split(' ').join(''))) return;
        if (p.participantId == 0) {
            let message = {};
            message.m = "a";
            message.a = msg.message;
            message.p = {
                color: "#ffffff",
                id: "0",
                name: "mpp",
                _id: "0"
            };
            message.t = Date.now();
            this.sendArray([message]);

            this.chatmsgs.push(message);
            this.setData();
            return;
        }
        let prsn = this.ppl.get(p.participantId);
        if (prsn) {
            let message = {};
            message.m = "a";
            message.a = msg.message;
            if (prsn.user.hasFlag('chat_curse_1')) {
                if (prsn.user.flags['chat_curse_1'] != false) message.a = message.a.split(/[aeiou]/).join('o').split(/[AEIOU]/).join('O');
            }
            if (prsn.user.hasFlag('chat_curse_2')) {
                
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
        }
    }

    playNote(cl, note) {
        let vel = Math.round(cl.user.flags["volume"])/100 || undefined;
        
        if (vel) {
            for (let no of note.n) {
                no.v /= vel;
            }
        }

        this.sendArray([{
            m: "n",
            n: note.n,
            p: cl.participantId,
            t: note.t
        }], cl, true);
    }

    kickban(_id, ms) {
        ms = parseInt(ms);

        if (ms >= (1000 * 60 * 60)) return;
        if (ms < 0) return;

        ms = Math.round(ms / 1000) * 1000;

        let user = this.connections.find((usr) => usr.user._id == _id);
        if (!user) return;
        let asd = true;
        let pthatbanned = this.ppl.get(this.crown.participantId);

        this.connections.filter((usr) => usr.participantId == user.participantId).forEach((u) => {
            user.bantime = Math.floor(Math.floor(ms / 1000) / 60);
            user.bannedtime = Date.now();
            user.msbanned = ms;

            this.bans.set(user.user._id, user);

            //if (this.crown && (this.crown.userId)) {
                u.setChannel("test/awkward", {});

                if (asd)
                    this.Notification(user.user._id,
                        "Notice",
                        `Banned from \"${this._id}\" for ${Math.floor(Math.floor(ms / 1000) / 60)} minutes.`,
                        "",
                        7000,
                        "#room",
                        "short"
                    )
                if (asd)
                    this.Notification("room",
                        "Notice",
                        `${pthatbanned.user.name} banned ${user.user.name} from the channel for ${Math.floor(Math.floor(ms / 1000) / 60)} minutes.`,
                        "",
                        7000,
                        "#room",
                        "short"
                    )
                if (this.crown && (this.crown.userId == _id)) {
                    this.Notification("room",
                        "Certificate of Award",
                        `Let it be known that ${user.user.name} kickbanned him/her self.`,
                        "",
                        7000,
                        "#room"
                    );
                }
            //}

        })
    }

    Notification(who, title, text, html, duration, target, klass, id) {
        new Notification({
            id: id,
            chat: undefined,
            refresh: undefined,
            title: title,
            text: text,
            html: html,
            duration: duration,
            target: target,
            class: klass
        }).send(who, this);
    }

    bindEventListeners() {
        this.on("bye", participant => {
            this.remove(participant);
        })

        this.on("m", (participant, x, y) => {
            this.setCoords(participant, x, y);
        })

        this.on("a", (participant, msg) => {
            this.chat(participant, msg);
        })
    }

    verifySet(_id, msg) {
        if(typeof(msg.set) !== 'object') {
            msg.set = {
                visible: true,
                color: this.server.defaultSettings.color, chat:true,
                crownsolo:false
            }
        }

        msg.set = RoomSettings.changeSettings(msg.set);
        
        if (typeof(msg.set.lobby) !== 'undefined') {
            if (msg.set.lobby == true) {
                if (!this.isLobby(_id)) delete msg.set.lobby; // keep it nice and clean
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