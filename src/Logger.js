const chalk = require('chalk');

class Logger {
    constructor (context) {
        this.context = context;
    }

    log(args) {
        console.log(chalk.blue(`[INFO] [${this.context}]`), args);
    }

    warn(args) {
        console.warn(chalk.yellow(`[WARNING] [${this.context}]`), args);
    }

    error(args) {
        console.error(chalk.red(`[ERROR] [${this.context}]`), args);
    }

    debug(args) {
        if (process.env.DEBUG_ENABLED) {
            console.log(chalk.green(`[DEBUG] [${this.context}]`), args);
        }
    }
}

module.exports = Logger;

