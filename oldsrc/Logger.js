const chalk = require('chalk');
const { EventEmitter } = require('events');

class Logger {
    static buffer = [];

    static on = EventEmitter.prototype.on;
    static off = EventEmitter.prototype.off;
    static once = EventEmitter.prototype.once;
    static emit = EventEmitter.prototype.emit;

    constructor (context) {
        this.context = context;
    }

    log(args) {
        let str = chalk.green(`[`) + chalk.green(`${this.context}`) + chalk.green(`]`) + ' ' + args
        console.log(str);
        this.buffer(str);
    }

    warn(args) {
        let str = chalk.yellow(`[WARN] [`) + chalk.yellow(`${this.context}`) + chalk.yellow(`]`) + ' ' + args;
        console.warn(str);
        this.buffer(str);
    }

    error(args) {
        let str = chalk.red(`[ERR] [`) + chalk.red(`${this.context}`) + chalk.red(`]`) + ' ' + args;
        console.error(str);
        this.buffer(str);
    }

    debug(args) {
        if (process.env.DEBUG_ENABLED) {
            let str = chalk.blue(`[DEBUG] [`) + chalk.blue(`${this.context}`) + chalk.blue(`]`) + ' ' + args;
            console.debug(str);
            this.buffer(str);
        }
    }

    buffer(str) {
        Logger.buffer.push(str);
        Logger.emit('buffer update', str);
    }
}

module.exports = Logger;
