export class Logger {
    private static log(method: string, ...args: any[]) {
        (console as unknown as Record<string, (..._args: any[]) => any>)[
            method
        ](this.getHHMMSS(), ...args);
    }

    public static getHHMMSS() {
        const ms = Date.now();

        const s = ms / 1000;
        const m = s / 60;
        const h = m / 60;

        const ss = Math.floor(s) % 60;
        const mm = Math.floor(m) % 60;
        const hh = Math.floor(h) % 24;

        return `${hh}:${mm}:${ss}`;
    }

    constructor(public id: string) {}

    public info(...args: any[]) {
        Logger.log("log", `[${this.id}]`, `[\x1b[34mINFO\x1b[0m]`, ...args);
    }

    public error(...args: any[]) {
        Logger.log("error", `[${this.id}]`, `[\x1b[31mERROR\x1b[0m]`, ...args);
    }

    public warn(...args: any[]) {
        Logger.log("warn", `[${this.id}]`, `[\x1b[33mWARN\x1b[0m]`, ...args);
    }

    public debug(...args: any[]) {
        Logger.log("debug", `[${this.id}]`, `[\x1b[32mDEBUG\x1b[0m]`, ...args);
    }
}
