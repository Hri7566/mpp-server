const chalk = require('chalk');

class Logger {
    constructor (context) {
        this.context = context;
    }

    log(args) {
        console.log(chalk.green(`[${this.context}]`), args);
    }

    warn(args) {
        console.warn(chalk.yellow(`[WARN] [${this.context}]`), args);
    }

    error(args) {
        console.error(chalk.red(`[ERR] [${this.context}]`), args);
    }

    debug(args) {
        if (process.env.DEBUG_ENABLED) {
            console.log(chalk.blue(`[DEBUG] [${this.context}]`), args);
        }
    }
}

module.exports = Logger;

