const { Logger } = require("./Logger");
const { EventEmitter } = require('events');
const { Data } = require("./Data");
const { Util } = require("./Util");

class Crown {
    constructor(p, cursor) {
        this.participantId = p.id;
        this.userId = p._id;
        this.t = Date.now() + 15000;
        
        this.startPos = {
            x: 50,
            y: 50
        }

        this.endPos = {
            x: Math.random() * 100,
            y: cursor.y
        }
    }
}

class ChannelSettings {
    static VALID = {
        "lobby": "boolean",
        "visible": "boolean",
        "chat": "boolean",
        "crownsolo": "boolean",
        "no cussing": "boolean",
        "lyrical notes": "boolean",
        "color": function(val) {
            return typeof val === "string" && val.match(/^#[0-9a-f]{6}$/i);
        },
        "color2": function(val) {
            return typeof val === "string" && val.match(/^#[0-9a-f]{6}$/i);
        },
        "owner_id": "string"
    };
}

const LOBBY_SETTINGS = {
    color: '#73b3cc',
    color2: '#273546',
    lobby: true,
}

class Channel extends EventEmitter {
    static channels = new Map();
    
    static channelExists(_id) {
        return typeof this.channels.get(_id) !== 'undefined';
    }

    constructor(server, _id, settings, owner) {
        super();

        this.server = server;
        this._id = _id;
        this.logger = new Logger('Channel ' + this._id, Logger.RED);
        
        if (Data.isAdmin(owner.user)) {
            this.settings = settings;
        } else {
            this.settings = ChannelSettings.verifySettings(settings);
        }

        this.settings = {
            chat: true,
            color: '#3b5054',
        }

        if (this.isLobby) {
            // no crown
            Util.mixin(this.settings, LOBBY_SETTINGS);
        } else {
            // crown
            this.crown = new Crown(owner.user, owner.cursor);
        }

        this.ppl = [];

        Channel.channels.set(this._id, this);

        this.bindEventListeners();

        this.join(owner);
    }

    bindEventListeners() {
        this.on('update', msg => {
            for (let id of this.ppl) {
                let cl = this.server.findClient(id);
                
                if (!cl) {
                    this.ppl.splice(this.ppl.indexOf(id), 1);
                    continue;
                }

                cl.sendArray([{
                    m: 'ch',
                    ch: this.getCurrentInfo(),
                    ppl: this.getParticipants(),
                    p: this.server.getParticipantID(cl)
                }]);
            }
        });
    }

    isLobby() {
        try {
            if (this._id == this.server.config.channels.lobbies_id) return true;
            let num = parseInt(this._id.susbtring(this.server.config.channels.lobbies_id.length, this._id.length));
            if (isNaN(num)) return false;
            if (num < 1) return false;
            if (num > 99) return false;
            return true;
        } catch (err) {
            return false;
        }
    }

    join(cl) {
        if (!cl.initialized) return;
        this.ppl.push(this.server.getParticipantID(cl));

        // this.sendArray([{
        //     m: 'ch',
        //     ch: this.getCurrentInfo(),
        //     ppl: this.getParticipants()
        // }], this.getAllExcludes(cl.user.id));

        cl.sendArray([{
            m: 'ch',
            ch: this.getCurrentInfo(),
            ppl: this.getParticipants(),
            id: this.server.getParticipantID(cl),
            p: this.server.getParticipantID(cl)
        }]);
        
        let p = {
            m: 'p',
            x: cl.cursor.x,
            y: cl.cursor.y
        }

        Util.mixin(p, cl.user);

        this.sendArray([p], [this.server.getParticipantID(cl)]);
    }

    leave(cl) {
        let id = this.server.getParticipantID(cl);
        this.ppl.splice(this.ppl.indexOf(id), 1);
        this.emit('update');
    }

    sendArray(msgs, exclude = []) {
        for (let id of this.ppl) {
            if (exclude.includes(id)) continue;
            let cl = this.server.findClient(id);

            if (!cl) continue;
            if (exclude.includes(cl)) continue;

            cl.sendArray(msgs);
        }
    }

    getCurrentInfo() {
        return {
            _id: this._id,
            id: this.id,
            settings: this.settings,
            crown: this.crown,
            count: this.ppl.length
        }
    }

    getParticipants() {
        let ppl = [];

        for (let id of this.ppl) {
            let cl = this.server.findClient(id);
            
            if (!cl) continue;

            let p = cl.getPublicParticipant();
            p.id = this.server.getParticipantID(cl);
            ppl.push(p);
        }
        
        return ppl;
    }

    getAllExcludes(id) {
        let exclude = [];
        
        for (let i of this.ppl) {
            if (i == id) continue;
            exclude.push(i);
        }

        return exclude;
    }
}

module.exports = {
    Channel
}
