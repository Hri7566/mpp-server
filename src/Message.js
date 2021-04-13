const Quota = require('./Quota');
const User = require("./User.js");
const Room = require("./Room.js");
const RoomSettings = require('./RoomSettings');

module.exports = (cl) => {
    cl.once("hi", (msg, admin) => {
        if (msg.hasOwnProperty("password")) {
            if (msg.password == "hideme") {
                cl.hidden = true;
            }
        }

        console.log(`hidden: ${cl.hidden}`);
        
        let m = {};
        m.m = "hi";
        m.motd = cl.server.welcome_motd;
        m.t = Date.now();
        m.u = {
            name: cl.user.name,
            _id: cl.user._id,
            id: cl.participantId,
            color: cl.user.color
        };

        m.v = "https://gitlab.com/hri7566/mpp-server";

        cl.sendArray([m]);
    });

    cl.on("t", msg => {
        if (msg.hasOwnProperty("e") && !isNaN(msg.e))
            cl.sendArray([{
                m: "t",
                t: Date.now(),
                e: msg.e
            }])
    });

    cl.on("ch", msg => {
        if (typeof(msg.set) !== 'object') msg.set = {};

        if (msg.hasOwnProperty("_id") && typeof msg._id == "string") {
            if (msg._id.length > 512) return;
            if (!cl.staticQuotas.room.attempt()) return;

            cl.setChannel(msg._id, msg.set);

            let param;
            if (cl.channel.isLobby(cl.channel._id)) {
                param = Quota.N_PARAMS_LOBBY;
            } else {
                if (!(cl.user._id == cl.channel.crown.userId)) {
                    param = Quota.N_PARAMS_NORMAL;
                } else {
                    param = Quota.N_PARAMS_RIDICULOUS;
                }
            }

            param.m = "nq";
            cl.sendArray([param]);
        }
    });

    cl.on("m", (msg, admin) => {
        // if (!cl.quotas.cursor.attempt() && !admin) return;
        if (!(cl.channel && cl.participantId)) return;
        if (!msg.hasOwnProperty("x")) msg.x = null;
        if (!msg.hasOwnProperty("y")) msg.y = null;
        if (parseInt(msg.x) == NaN) msg.x = null;
        if (parseInt(msg.y) == NaN) msg.y = null;
        cl.channel.emit("m", cl, msg.x, msg.y);
    });

    cl.on("chown", (msg, admin) => {
        if (!cl.quotas.chown.attempt() && !admin) return;
        if (!(cl.channel && cl.participantId)) return;

        //console.log((Date.now() - cl.channel.crown.time))
        //console.log(!(cl.channel.crown.userId != cl.user._id), !((Date.now() - cl.channel.crown.time) > 15000));

        if (!(cl.channel.crown.userId == cl.user._id) && !((Date.now() - cl.channel.crown.time) > 15000)) return;

        if (msg.hasOwnProperty("id")) {
            // console.log(cl.channel.crown)
            if (!admin) {
                if (cl.user._id == cl.channel.crown.userId || cl.channel.crowndropped) {
                    cl.channel.chown(msg.id);
                    if (msg.id == cl.user.id) {
                        param =  Quota.N_PARAMS_RIDICULOUS;
                        param.m = "nq";
                        cl.sendArray([param])
                    }
                }
            } else {
                cl.channel.chown(msg.id);
                if (msg.id == cl.user.id) {
                    param =  Quota.N_PARAMS_RIDICULOUS;
                    param.m = "nq";
                    cl.sendArray([param])
                }
            }
        } else {
            if (!admin) {
                if (cl.user._id == cl.channel.crown.userId || cl.channel.crowndropped) {
                    cl.channel.chown();
                    param =  Quota.N_PARAMS_NORMAL;
                    param.m = "nq";
                    cl.sendArray([param])
                }
            } else {
                cl.channel.chown();
                param =  Quota.N_PARAMS_NORMAL;
                param.m = "nq";
                cl.sendArray([param]);
            }
        }
    });

    cl.on("chset", (msg, admin) => {
        if (!(cl.channel && cl.participantId)) return;
        if (!cl.channel.crown && !admin) return;
        if (!admin) {
            if (!(cl.user._id == cl.channel.crown.userId)) return;
        }
        if (!msg.hasOwnProperty("set") || !msg.set) msg.set = new RoomSettings(cl.channel.settings, 'user');
        cl.channel.settings.changeSettings(msg.set);
        cl.channel.updateCh();
    });

    cl.on("a", (msg, admin) => {
        if (!(cl.channel && cl.participantId)) return;
        if (!msg.hasOwnProperty('message')) return;
        if (typeof(msg.message) !== 'string') return;
        if (cl.channel.settings.chat) {
            if (cl.channel.isLobby(cl.channel._id)) {
                if (!cl.quotas.chat.lobby.attempt() && !admin) return;
            } else {
                if (!(cl.user._id == cl.channel.crown.userId)) {
                    if (!cl.quotas.chat.normal.attempt() && !admin) return;
                } else {
                    if (!cl.quotas.chat.insane.attempt() && !admin) return;
                }
            }
            cl.channel.emit('a', cl, msg);
        }
    });

    cl.on('n', msg => {
        if (!(cl.channel && cl.participantId)) return;
        if (!msg.hasOwnProperty('t') || !msg.hasOwnProperty('n')) return;
        if (typeof msg.t != 'number' || typeof msg.n != 'object') return;
        if (cl.channel.settings.crownsolo) {
            if ((cl.channel.crown.userId == cl.user._id) && !cl.channel.crowndropped) {
                cl.channel.playNote(cl, msg);
            }
        } else {
            cl.channel.playNote(cl, msg);
        }
    });

    cl.on('+ls', msg => {
        if (!(cl.channel && cl.participantId)) return;
        cl.server.roomlisteners.set(cl.connectionid, cl);
        let rooms = [];
        for (let room of Array.from(cl.server.rooms.values())) {
            let data = room.fetchData().ch;
            if (room.bans.get(cl.user._id)) {
                data.banned = true;
            }
            if (room.settings.visible) rooms.push(data);
        }
        cl.sendArray([{
            "m": "ls",
            "c": true,
            "u": rooms
        }])
    });

    cl.on('-ls', msg => {
        if (!(cl.channel && cl.participantId)) return;
        cl.server.roomlisteners.delete(cl.connectionid);
    });

    cl.on("userset", msg => {
        if (!(cl.channel && cl.participantId)) return;
        if (!msg.hasOwnProperty("set") || !msg.set) msg.set = {};
        if (msg.set.hasOwnProperty('name') && typeof msg.set.name == "string") {
            if (msg.set.name.length > 40) return;
            if(!cl.quotas.userset.attempt()) return;
            cl.user.name = msg.set.name;
            let user = new User(cl);
            user.getUserData().then((usr) => {
                let dbentry = user.userdb.get(cl.user._id);
                if (!dbentry) return;
                dbentry.name = msg.set.name;
                user.updatedb();
                cl.server.rooms.forEach((room) => {
                    room.updateParticipant(cl.user._id, {
                        name: msg.set.name
                    });
                })
            })

        }
    });

    cl.on('kickban', msg => {
        if (cl.channel.crown == null) return;
        if (!(cl.channel && cl.participantId)) return;
        if (!cl.channel.crown.userId) return;
        if (!(cl.user._id == cl.channel.crown.userId)) return;
        if (msg.hasOwnProperty('_id') && typeof msg._id == "string") {
            if (!cl.quotas.kickban.attempt() && !admin) return;
            let _id = msg._id;
            let ms = msg.ms || 3600000;
            cl.channel.kickban(_id, ms);
        }
    });

    cl.on("bye", msg => {
        cl.destroy();
    });

    cl.on("admin message", msg => {
        if (!(cl.channel && cl.participantId)) return;
        if (!msg.hasOwnProperty('password') || !msg.hasOwnProperty('msg')) return;
        if (typeof msg.msg != 'object') return;
        if (msg.password !== cl.server.adminpass) return;
        cl.ws.emit("message", JSON.stringify([msg.msg]), true);
    });

    //admin only stuff
    cl.on('color', (msg, admin) => {
        if (!admin) return;
        if (typeof cl.channel.verifyColor(msg.color) != 'string') return;
        if (!msg.hasOwnProperty('id') && !msg.hasOwnProperty('_id')) return;
        cl.server.connections.forEach((usr) => {
            if ((usr.channel && usr.participantId && usr.user) && (usr.user._id == msg._id || (usr.participantId == msg.id))) {
                let user = new User(usr);
                user.cl.user.color = msg.color;
                user.getUserData().then((uSr) => {
                    if (!uSr._id) return;
                    let dbentry = user.userdb.get(uSr._id);
                    if (!dbentry) return;
                    dbentry.color = msg.color;
                    user.updatedb();
                    cl.server.rooms.forEach((room) => {
                        room.updateParticipant(usr.user._id, {
                            color: msg.color
                        });
                    })
                })
            }
        })

    });

    cl.on('eval', (msg, admin) => {
        if (!admin) return;
        if (!msg.hasOwnProperty('str')) return;
        cl.server.ev(msg.str);
    });

    cl.on('notification', (msg, admin) => {
        if (!admin) return;
        if (!msg.hasOwnProperty("id") || (!msg.hasOwnProperty("targetChannel") && !msg.hasOwnProperty("targetUser")) || !msg.hasOwnProperty("target") || !msg.hasOwnProperty("duration") || !msg.hasOwnProperty("class") || !msg.hasOwnProperty("html")) return;
        cl.channel.Notification(msg.targetUser || msg.targetChannel, null, null, msg.html, msg.duration, msg.target, msg.class);
    });
}
