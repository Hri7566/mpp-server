import { padNum, unimportant } from "./helpers";

/**
 * A logger that doesn't fuck with the readline prompt
 * timestamps are likely wrong because of js timezones
 **/
export class Logger {
    private static log(method: string, ...args: any[]) {
        // Un-fuck the readline prompt
        process.stdout.write("\x1b[2K\r");

        // Log
        (console as unknown as Record<string, (..._args: any[]) => any>)[
            method
        ](
            unimportant(this.getDate()),
            unimportant(this.getHHMMSSMS()),
            ...args
        );

        // Re-print the readline prompt (spooky cringe global variable)
        if ((globalThis as unknown as any).rl)
            (globalThis as unknown as any).rl.prompt();
    }

    public static getHHMMSSMS() {
        const ms = Date.now();

        const s = ms / 1000;
        const m = s / 60;
        const h = m / 60;

        const ss = padNum(Math.floor(s) % 60, 2, "0");
        const mm = padNum(Math.floor(m) % 60, 2, "0");
        const hh = padNum(Math.floor(h) % 24, 2, "0");
        const ll = padNum(ms % 1000, 3, "0");

        return `${hh}:${mm}:${ss}.${ll}`;
    }

    public static getDate() {
        return new Date().toISOString().split("T")[0];
    }

    constructor(public id: string) { }

    public info(...args: any[]) {
        Logger.log("log", `[${this.id}]`, `\x1b[34m[info]\x1b[0m`, ...args);
    }

    public error(...args: any[]) {
        Logger.log("error", `[${this.id}]`, `\x1b[31m[error]\x1b[0m`, ...args);
    }

    public warn(...args: any[]) {
        Logger.log("warn", `[${this.id}]`, `\x1b[33m[warn]\x1b[0m`, ...args);
    }

    public debug(...args: any[]) {
        Logger.log("debug", `[${this.id}]`, `\x1b[32m[debug]\x1b[0m`, ...args);
    }
}
