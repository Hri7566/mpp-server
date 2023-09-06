const Client = require('mppclone-client');
const Logger = require('./src/Logger');
const { EventEmitter } = require('events');

const token = process.env.MPPCLONE_TOKEN;

class Command {
    static commands = {};

    static getUsage(us, prefix) {
        return us.split('%PREFIX%').join(prefix);
    }

    constructor(cmd, desc, usage, minargs, func, minrank, hidden) {
        this.cmd = typeof cmd == 'object' ? cmd : [cmd];
        this.desc = desc || "No description";
        this.usage = usage || "No usage";
        this.minargs = minargs || 0;
        this.func = func;
        this.minrank = minrank || 0;
        this.hidden = hidden || false;

        Command.commands[this.cmd[0]] = this;
    }
}

class Rank {
    static ranks = {};

    static user_ranks = {};

    static setRank(_id, rank) {
        Rank.user_ranks[_id] = rank;
    }

    static getRank(_id) {
        return Rank.user_ranks[_id];
    }

    constructor(name, desc, minrank) {
        this.name = name;
        this.desc = desc;
        this.minrank = minrank;

        Rank.ranks[name] = this;
    }
}

new Rank("User", "Default rank", 0);
new Rank("Mod", "Moderator rank", 1);
new Rank("Admin", "Administrator rank", 2);
new Rank("Owner", "Owner rank", 3);

class Prefix {
    static prefixes = {};

    static hasAnyPrefix(str) {
        for (let i in Prefix.prefixes) {
            if (str.startsWith(Prefix.prefixes[i].prefix)) {
                return true;
            }
        }
    }

    static getPrefixFromString(str) {
        for (let i in Prefix.prefixes) {
            if (str.startsWith(Prefix.prefixes[i].prefix)) {
                return Prefix.prefixes[i];
            }
        }
    }

    constructor(id, prefix) {
        this.id = id;
        this.prefix = prefix;

        Prefix.prefixes[id] = this;
    }
}

class Bot extends EventEmitter {
    constructor(cl) {
        super();

        this.logger = new Logger('MPPClone Bot');

        this.client = cl;
        this.bindEventListeners();

        this.userset = {
            name: 'mpp.hri7566.info [indev]', // TODO change this name
            color: '#76b0db'
        };

        this.chatBuffer = [];
        this.chatBufferCycleCounter = 0;

        this.chatBufferCycle();

        this.client.start();
        this.client.setChannel('✧𝓓𝓔𝓥 𝓡𝓸𝓸𝓶✧');
    }

    bindEventListeners() {
        this.client.on('a', msg => {
            this.emit('receiveChat', msg);
        });

        this.client.on('ch', msg => {
            this.emit('resetName', msg);
        })

        this.client.on('hi', msg => {
            this.emit('online', msg);
        });

        this.client.on('t', msg => {
            this.emit('resetName', msg);
        });

        this.on('resetName', () => {
            if (this.client.getOwnParticipant().name !== this.userset.name || this.client.getOwnParticipant().color !== this.userset.color) {
                this.client.sendArray([{
                    m: 'userset',
                    set: this.userset
                }]);
            }
        });

        this.on('receiveChat', msg => {
            if (Prefix.hasAnyPrefix(msg.a)) {
                msg.prefix = Prefix.getPrefixFromString(msg.a);
                this.emit('runCommand', msg);
            }
        });

        this.on('addToChatBuffer', msg => {
            this.chatBuffer.push(msg);
        });

        this.on('runCommand', msg => {
            if (!msg.prefix) return;
            
            msg.args = msg.a.split(' ');
            msg.cmd = msg.args[0].substring(msg.prefix.prefix.length).trim();
            msg.argcat = msg.a.substring(msg.args[0].length).trim();

            let rank = Rank.getRank(msg.p._id);
            if (!rank) {
                rank = Rank.ranks['User'];
                Rank.setRank(msg.p._id, rank);
            }
            
            msg.rank = rank;

            for (let cmd of Object.values(Command.commands)) {
                if (!cmd.cmd.includes(msg.cmd)) continue;
                console.log(msg.cmd, cmd.cmd);
                if (msg.args.length < cmd.minargs) return;
                if (msg.rank.id < cmd.minrank) return;

                try {
                    let out = cmd.func(msg);
                    if (!out) return;
                    
                    out = out.split('\n').join(' ').split('\t').join(' ').split('\r').join(' ');
                    
                    if (out !== '') {
                        this.emit('addToChatBuffer', {
                            m: 'a',
                            message: out,
                            p: msg.p._id
                        });
                    }
                } catch (e) {
                    this.emit('addToChatBuffer', {
                        m: 'a',
                        message: 'An error has occurred.',
                        p: msg.p._id
                    });
                }
            }
        });

        this.on('online', () => {
            this.logger.log('Connected');
        });
    }

    async chatBufferCycle() {
        if (this.chatBuffer.length <= 0) {
            setTimeout(() => {
                this.chatBufferCycle();
            });
            return;
        }
        this.chatBufferCycleCounter++;
        let time = 0;
        if (this.chatBufferCycleCounter > 4) {
            time += 1000;
        }
        setTimeout(() => {
            let nextMessage = this.chatBuffer.shift();
            this.client.sendArray([nextMessage]);
            this.chatBufferCycle();
            this.chatBufferCycleCounter--;
        }, time);
    }
}

new Prefix('hmpp!', 'hmpp!');
new Prefix('h!', 'h!');

new Command(['help', 'cmds', 'h'], 'List all commands', '%PREFIX%help', 0, (msg) => {
    let cmds = 'Commands: ';
    for (let cmd of Object.values(Command.commands)) {
        if (cmd.hidden) continue;
        cmds += `${cmd.cmd[0]}, `;
    }
    cmds = cmds.substring(0, cmds.length - 2).trim();
    return cmds;
}, 0, false);

new Command(['users'], 'See how many users are online', `%PREFIX%users`, 0, (msg) => {
    console.log(SERVER.connections.size);
    return `There are ${SERVER.connections.size} users on HMPP.`;
}, 0, false);

let cl = new Client("wss://mppclone.com:8443", token);

let bot = new Bot(cl);
