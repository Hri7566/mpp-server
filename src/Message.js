const Quota = require('./Quota');
const User = require("./User.js");
const Channel = require("./Channel.js");
const RoomSettings = require('./RoomSettings');
const Database = require('./Database');
const { MOTDGenerator } = require('./MOTDGenerator');

module.exports = (cl) => {
    cl.once("hi", (msg, admin) => {
        if (msg.hasOwnProperty("password")) {
            if (msg.password == "hideme") {
                cl.hidden = true;
            }
        }
        
        let m = {};
        m.m = "hi";
        m.motd = MOTDGenerator.getCurrentMOTD();
        m.t = Date.now();
        m.u = {
            name: cl.user.name,
            _id: cl.user._id,
            id: cl.participantId,
            color: cl.user.color
        };

        m.v = "2.0";
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

        if (typeof(msg._id) == "string") {
            if (msg._id.length > 512) return;
            if (!cl.staticQuotas.room.attempt()) return;

            cl.user.checkFlags();

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
            setTimeout(() => {
                cl.sendArray([param]);
            }, 1000);
        }
    });

    cl.on("m", (msg, admin) => {
        // nobody will see our cursor if we're not somewhere
        if (!('channel' in cl)) return;

        // check against cursor rate limit
        if (!cl.quotas.cursor.attempt() && !admin) return;

        // if we are nobody, we don't have a cursor
        if (!cl.participantId) return;

        // no values? null, not undefined
        if (!msg.hasOwnProperty("x")) msg.x = null;
        if (!msg.hasOwnProperty("y")) msg.y = null;
        if (isNaN(parseFloat(msg.x))) msg.x = null;
        if (isNaN(parseFloat(msg.y))) msg.y = null;

        let m = {
            p: cl.participantId,
            x: msg.x,
            y: msg.y
        }

        cl.channel.emit("m", m);
    });

    cl.on("chown", (msg, admin) => {
        if (!cl.quotas.chown.attempt() && !admin) return;
        if (!(cl.channel && cl.participantId)) return;

        //console.log((Date.now() - cl.channel.crown.time))
        //console.log(!(cl.channel.crown.userId != cl.user._id), !((Date.now() - cl.channel.crown.time) > 15000));

        if (!cl.channel.crown && !admin) {
            if (!(cl.channel.crown.userId == cl.user._id) && !((Date.now() - cl.channel.crown.time) > 15000)) return;
        }

        if (msg.hasOwnProperty("id")) {
            // console.log(cl.channel.crown)
            if (!admin) {
                if (cl.user._id == cl.channel.crown.userId || cl.channel.crowndropped) {
                    cl.channel.chown(msg.id);
                    if (msg.id == cl.user.id) {
                        param =  Quota.N_PARAMS_RIDICULOUS;
                        param.m = "nq";
                        cl.sendArray([param]);
                    }
                }
            } else {
                cl.channel.chown(msg.id);
                if (msg.id == cl.user.id) {
                    param =  Quota.N_PARAMS_RIDICULOUS;
                    param.m = "nq";
                    cl.sendArray([param]);
                }
            }
        } else {
            if (!admin) {
                if (cl.user._id == cl.channel.crown.userId || cl.channel.crowndropped) {
                    cl.channel.chown();
                    param =  Quota.N_PARAMS_NORMAL;
                    param.m = "nq";
                    cl.sendArray([param]);
                }
            } else {
                cl.channel.chown();
                param =  Quota.N_PARAMS_RIDICULOUS;
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
        cl.channel.settings.changeSettings(msg.set, admin);
        // cl.channel.updateCh();
        cl.channel.emit('update');
    });

    cl.on('a', (msg, admin) => {
        if (!(cl.channel && cl.participantId)) return;
        if (!msg.hasOwnProperty('message')) return;
        if (typeof(msg.message) !== 'string') return;
        if (cl.channel.settings.chat) {
			if (admin && msg.admin == true) {
				cl.channel.adminChat(msg.message);
			} else {
				if (cl.channel.isLobby(cl.channel._id)) {
					if (!cl.quotas.chat.lobby.attempt() && !admin && !cl.user.hasFlag('no chat rate limit', true)) return;
				} else {
					if (!(cl.user._id == cl.channel.crown.userId)) {
						if (!cl.quotas.chat.normal.attempt() && !admin && !cl.user.hasFlag('no chat rate limit', true)) return;
					} else {
						if (!cl.quotas.chat.insane.attempt() && !admin && !cl.user.hasFlag('no chat rate limit', true)) return;
					}
				}
				cl.channel.emit('a', cl, msg);
			}
        }
    });

    cl.on('n', (msg, admin) => {
        if (!(cl.channel && cl.participantId)) return;
        if (!msg.hasOwnProperty('t') || !msg.hasOwnProperty('n')) return;
        if (typeof msg.t != 'number' || typeof msg.n != 'object') return;

		// if (cl.quotas.note && !admin) {
		// 	if (!cl.quotas.note.attempt())  return;
		// }
		
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
            let data = room.fetchChannelData().ch;
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

    cl.on("userset", (msg, admin) => {
        if (!(cl.channel && cl.participantId)) return;
        if (!msg.hasOwnProperty("set") || !msg.set) msg.set = {};
        if (msg.set.hasOwnProperty('name') && typeof msg.set.name == "string") {
            cl.userset(msg.set.name, admin);
        }
    });

    cl.on('kickban', (msg, admin) => {
        if (!admin) {
            if (cl.channel.crown == null) return;
            if (!(cl.channel && cl.participantId)) return;
            if (!cl.channel.crown.userId) return;
            if (!(cl.user._id == cl.channel.crown.userId)) return;
        }
        if (msg.hasOwnProperty('_id') && typeof msg._id == "string") {
            if (!cl.quotas.kickban.attempt() && !admin) return;
            let _id = msg._id;
            let ms = msg.ms || 36e5;
            cl.channel.kickban(_id, ms);
        }
    });

    cl.on('unban', (msg, admin) => {
        if (!admin) {
            if (cl.channel.crown == null) return;
            if (!(cl.channel && cl.participantId)) return;
            if (!cl.channel.crown.userId) return;
            if (!(cl.user._id == cl.channel.crown.userId)) return;
        }
        if (msg.hasOwnProperty('_id') && typeof msg._id == "string") {
            if (!cl.quotas.kickban.attempt() && !admin) return;
            let _id = msg._id;
            cl.channel.unban(_id);
        }
    });

    cl.on("bye", msg => {
        cl.user.stopFlagEvents();
        cl.destroy();
    });

    cl.on("admin message", msg => {
        // if (!(cl.channel && cl.participantId)) return;
        if (!msg.hasOwnProperty('password') || !msg.hasOwnProperty('msg')) return;
        if (typeof msg.msg != 'object') return;
        if (msg.password !== cl.server.adminpass) return;
        cl.ws.emit("message", JSON.stringify([msg.msg]), true);
    });

    //admin only stuff
    // TODO move all admin messages to their own stream
    cl.on('color', (msg, admin) => {
        if (!admin) return;
        if (!msg.color) return;
        // if (typeof cl.channel.verifyColor(msg.color) != 'string') return;
        if (!msg.hasOwnProperty('id') && !msg.hasOwnProperty('_id')) return;
        cl.server.connections.forEach(c => {
            if (c.destroied) return;
            if (c.user._id !== msg._id && c.participantId !== msg.id) return;

            c.user.color = msg.color;
            require("./Database").updateUser(c.user._id, c.user);
            cl.channel.updateParticipant(c.user._id, c.user);
        });
    });

    cl.on('eval', (msg, admin) => {
        if (!admin) return;
        if (!msg.hasOwnProperty('str')) return;
        cl.server.ev(msg.str);
    });

    cl.on('notification', (msg, admin) => {
        if (!admin) return;
        if (!msg.hasOwnProperty("id") || (!msg.hasOwnProperty("targetChannel") && !msg.hasOwnProperty("targetUser"))
                || !msg.hasOwnProperty("target") || !msg.hasOwnProperty("duration")) return;

        let id = msg.id;
        let targetChannel = msg.targetChannel;
        let targetUser = msg.targetUser;
        let target = msg.target;
        let duration = msg.duration;
        let klass;
        let title;
        let text;
        let html;

        if (msg.hasOwnProperty("class")) {
            klass = msg.class;
        }

        if (!msg.hasOwnProperty("html")) {
            if (!msg.hasOwnProperty("title") || !msg.hasOwnProperty("text")) return;
            title = msg.title;
            text = msg.text;
        } else {
            html = msg.html;
        }

        cl.channel.Notification(targetUser || targetChannel, title, text, html, duration, target, klass, id);
    });

    cl.on('user_flag', (msg, admin) => {
        if (!admin) return;
        if (!msg.hasOwnProperty('_id') || !msg.hasOwnProperty('key') || !msg.hasOwnProperty('value')) return;

        cl.server.connections.forEach((usr) => {
            if ((usr.channel && usr.participantId && usr.user) && (usr.user._id == msg._id || (usr.participantId == msg.id))) {
                if (!usr.hasOwnProperty('user')) return;
                if (msg.key == "remove") {
                    delete usr.user.flags[msg.key];
                    usr.user.flags[msg.key] = undefined;
                    return;
                }
                usr.user.flags[msg.key] = msg.value;
                Database.updateUser(usr.user._id, usr.user);
                usr.user.checkFlags();
            }
        });
    });

    cl.on('channel_flag', (msg, admin) => {
        if (!admin) return;
        if (!msg.hasOwnProperty('_id') || !msg.hasOwnProperty('key') || !msg.hasOwnProperty('value')) return;
        
        try {
            let ch = cl.server.rooms.get(msg._id);
            ch.flags[msg.key] = msg.value;
            ch.emit('flag ' + msg.key, msg.value);
        } catch(err) {
            console.error(err);
        }
    });

    cl.on('room_flag', (msg, admin) => {
        if (!admin) return;
        cl.emit('channel_flag', msg, admin);
    })

    cl.on('clear_chat', (msg, admin) => {
        if (!admin) return;
        cl.channel.setChatArray([]);
    });

    cl.on('sudo', (msg, admin) => {
        if (!admin) return;
        if (typeof msg._id !== 'string') return;
        if (typeof msg.msg !== 'object') return;
        if (!msg.msg.m) return;
        cl.server.connections.forEach(c => {
            if (c.user._id !== msg._id) return;
            c.emit(msg.msg.m, msg.msg);
        });
    });

    cl.on('subscribe to admin stream', (msg, admin) => {
        // if (!admin) return;
        if (!('password' in msg)) return;
        if (msg.password !== cl.server.adminpass) return;
        cl.isSubscribedToAdminStream = true;
        let interval = 8000;
        if ('interval_ms' in msg) interval = msg['interval_ms'];
        cl.sendAdminData();
        cl.adminStreamInterval = setInterval(() => {
            if (cl.isSubscribedToAdminStream == true) cl.sendAdminData();
        }, interval);
    });

    cl.on('unsubscribe from admin stream', (msg, admin) => {
        // if (!admin) return;
        if (!('password' in msg)) return;
        if (msg.password !== cl.server.adminpass) return;
        cl.isSubscribedToAdminStream = false;
        if (cl.adminStreamInterval) {
            clearInterval(cl.adminStreamInterval);
            cl.adminStreamInterval = undefined;
            while (cl.adminStreamInterval !== undefined) {
                cl.adminStreamInterval = undefined;
            }
        }
    });

    cl.on('channel message', (msg, admin) => {
        if (!admin) return;

        if (!msg.hasOwnProperty('msg')) return;
        if (typeof msg.msg != 'object') return;
        if (typeof msg.msg.m != 'string') return;

        if (!cl.channel) return;
        if (!msg.hasOwnProperty('_id')) msg._id = cl.channel._id;

        let ch = cl.server.rooms.get(msg._id);
        if (!ch) return;
        ch.emit(msg.msg.m, msg.msg);
    });

    cl.on('name', (msg, admin) => {
        if (!admin) return;
        
        if (!msg.hasOwnProperty('_id')) return;
        if (!msg.hasOwnProperty('name')) return;
        
        for (const [mapID, conn] of cl.server.connections) {
            if (!conn.user) return;
            if (conn.user._id == msg._id) {
                let c = conn;
                c.userset(msg.name, true);
            }
        }
    });

    cl.on('restart', (msg, admin) => {
        if (!admin) return;
        cl.server.restart(msg.notification);
    });
}
