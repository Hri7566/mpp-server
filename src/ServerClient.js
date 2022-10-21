const EventEmitter = require("events");
const { Channel } = require("./Channel");
const { Crypto } = require("./Crypto");
const { Data } = require("./Data");
const { Logger } = require("./Logger");
const { Util } = require("./Util");

class ServerClient extends EventEmitter {
    logger = new Logger("Client Instance");
    alreadyBound = false;
    closed = false;

    constructor(server, ws) {
        super();
        this.server = server;
        this.ws = ws;
        this.initialized = false;
        // this.logger.log('Connected');

        this._id = Crypto.getUserID(Buffer.from(ws.getRemoteAddress()).toString())

        this.cursor = {
            x: -10,
            y: -10
        }

        this.bindEventListeners();
    }

    setClosed(closed = true) {
        this.closed = closed;
    }

    sendArray(msgs) {
        try {
            // if (!this.initialized) return;
            this.ws.send(JSON.stringify(msgs));
        } catch (err) {
            this.logger.error(err);
        }
    }

    destroy() {
        this.logger.debug('Destroying...');
        if (!this.closed) {
            this.ws.end();
        }
    }

    bindEventListeners() {
        if (this.alreadyBound) return;
        this.alreadyBound = true;

        this.on('hi', async msg => {
            this.user = await Data.getUser(this._id);

            if (this.user == null) {
                this.user = this.server.getDefaultUser(this._id);
                await Data.updateUser(this._id, this.user);
            }

            let { id, ...p } = Util.cleanParticipant(this.user);

            this.sendArray([{
                m: 'hi',
                u: p,
                motd: this.server.motd
            }]);

            this.initialized = true;
        });

        this.on('ch', async msg => {
            // TODO sanitize
            if (!Channel.channelExists(msg._id)) {
                this.channel = new Channel(this.server, msg._id, msg.set, this);
            } else {
                this.channel = Channel.channels.get(msg._id);
                this.channel.join(this);
            }
        });

        this.on('t', async msg => {
            this.sendArray([{
                m: 't',
                t: Date.now(),
                e: msg.e
            }]);
        });
    }

    getPublicParticipant() {
        return Util.cleanParticipant(this.user);
    }
}

module.exports = {
    ServerClient
}
