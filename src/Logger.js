const { Util } = require("./Util");

function full_log(method, ...args) {
    let t = Util.getHHMMSSMS();
    console[method](`${t.hh}:${t.mm}:${t.ss}`, ...args);
}

class Logger {
    static RED(...args) {
        if (args.length > 1) {
            let out = [];
            for (let arg of args) {
                out += `\x1b[31m${arg}\x1b[0m`
            }
            return out;
        } else {
            return `\x1b[31m${args[0]}\x1b[0m`
        }
    }

    static GREEN(...args) {
        if (args.length > 1) {
            let out = [];
            for (let arg of args) {
                out += `\x1b[32m${arg}\x1b[0m`
            }
            return out;
        } else {
            return `\x1b[32m${args[0]}\x1b[0m`
        }
    }

    static BLUE(...args) {
        if (args.length > 1) {
            let out = [];
            for (let arg of args) {
                out += `\x1b[37m${arg}\x1b[0m`
            }
            return out;
        } else {
            return `\x1b[37m${args[0]}\x1b[0m`
        }
    }

    static WHITE(...args) {
        if (args.length > 1) {
            let out = [];
            for (let arg of args) {
                out += `\x1b[37m${arg}\x1b[0m`
            }
            return out;
        } else {
            return `\x1b[37m${args[0]}\x1b[0m`
        }
    }

    constructor(id, color) {
        this.id = id;
        this.color = color;
    }

    log(...args) {
        full_log('log', '[INFO]', this.color ? this.color(`[${this.id}]`) : `[${this.id}]`, ...args);
    }

    info = this.log;

    error(...args) {
        full_log('error', '[ERROR]', this.color ? this.color(`[${this.id}]`) : `[${this.id}]`, ...args);
    }

    warn(...args) {
        full_log('error', '[WARNING]', this.color ? this.color(`[${this.id}]`) : `[${this.id}]`, ...args);
    }

    debug(...args) {
        full_log('debug', '[DEBUG]', this.color ? this.color(`[${this.id}]`) : `[${this.id}]`, ...args);
    }
}

module.exports = {
    Logger
}
