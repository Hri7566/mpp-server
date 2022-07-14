const chalk = require('chalk');

class Logger {
    constructor (context) {
        this.context = context;
    }

    log(args) {
        console.log(chalk.green(`[`) + chalk.green(`${this.context}`) + chalk.green(`]`), args);
    }

    warn(args) {
        console.warn(chalk.yellow(`[WARN] [`) + chalk.yellow(`${this.context}`) + chalk.yellow(`]`), args);
    }

    error(args) {
        console.error(chalk.red(`[ERR] [`) + chalk.red(`${this.context}`) + chalk.red(`]`), args);
    }

    debug(args) {
        if (process.env.DEBUG_ENABLED) {
            console.log(chalk.blue(`[DEBUG] [`) + chalk.blue(`${this.context}`) + chalk.blue(`]`), args);
        }
    }
}

module.exports = Logger;

