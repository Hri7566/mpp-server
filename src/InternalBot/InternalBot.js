const { EventEmitter } = require('events');
const { Command } = require('./Command');
const Color = require('../Color');

class InternalBot {
    static on = EventEmitter.prototype.on;
    static off = EventEmitter.prototype.off;
    static emit = EventEmitter.prototype.emit;
    static once = EventEmitter.prototype.once;

    static prefix = '!';

    static bindEventListeners() {
        if (this.alreadyBound) return;
        this.alreadyBound = true;

        this.on('receive message', (msg, cl, ch) => {
            /**
             * msg.a - chat message
             * msg.p - participant
             * msg.t - timestamp
             */

            let isAdmin = false;
            if (cl.user.hasFlag('admin')) {
                isAdmin = true;
            }

            let args = msg.a.split(' ');
            let cmd = args[0].toLowerCase().substring(this.prefix.length);
            let argcat = msg.a.substring(args[0].length).trim();
            let p = cl;

            if (!args[0].startsWith(this.prefix)) return;
    
            switch (cmd) {
                case "ping":
                    ch.adminChat('pong');
                    break;
                case "setcolor":
                case "color":
                    if (!isAdmin) {
                        ch.adminChat("You do not have permission to use this command.");
                        return;
                    }
                    let color = ch.verifyColor(args[1]);
                    if (color) {
                        let c = new Color(color);
                        if (!args[2]) {
                            p.emit("color", {
                                color: c.toHexa(),
                                _id: p.user._id
                            }, true);
                            ch.adminChat(`Your color is now ${c.getName().replace('A', 'a')} [${c.toHexa()}]`);
                        } else {
                            let winner = ch.server.getAllClientsByUserID(args[2])[0];
                            if (winner) {
                                p.emit("color", {
                                    color: c.toHexa(),
                                    _id: winner.user._id
                                }, true);
                                ch.adminChat(`Friend ${winner.user.name}'s color is now ${c.getName().replace('A', 'a')}.`);
                            } else {
                                ch.adminChat("The friend you are looking for (" + args[2] + ") is not around.");
                            }
                        }
                    } else {
                        ch.adminChat("Invalid color.");
                    }
                    ch.updateCh();
                    break;
                case "users":
                    ch.adminChat(`There are ${ch.server.connections.size} users online.`);
                    break;
                case "chown":
                    if (!isAdmin) return;
                    let id = p.participantId;
                    if (args[1]) {
                        id = args[1];
                    }
                    if (ch.hasUser(id)) {
                        ch.chown(id);
                    }
                    break;
                case "chlist":
                case "channellist":
                    if (!isAdmin) return;
                    ch.adminChat("Channels:");
                    for (let [_id] of ch.server.rooms) {
                        ch.adminChat(`- ${_id}`);
                    }
                    break;
                case "restart":
                    if (!isAdmin) return;
                    cl.server.restart();
                    break;
                case "eval":
                case "javascript":
                    if (!isAdmin) return;
                    cl.server.ev(argcat);
                    break;
            }
        });
    }
}

InternalBot.bindEventListeners();

module.exports = {
    InternalBot
}
