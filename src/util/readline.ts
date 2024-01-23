import readline from "readline";
import { Logger } from "./Logger";

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const logger = new Logger("CLI");

rl.setPrompt("mpps> ");
rl.prompt();

class Command {
    public static commands: Command[] = [];
    public static async handleCommand(line: string) {
        const args = line.split(" ");
        const cmd = args[0].toLowerCase();

        let foundCommand: Command | undefined;

        for (const command of this.commands) {
            if (
                command.aliases.map(alias => alias.toLowerCase()).includes(cmd)
            ) {
                foundCommand = command;
            }
        }

        if (!foundCommand) return `No such command "${cmd}"`;

        try {
            const out = await foundCommand.callback({
                a: line,
                cmd,
                args
            });

            if (out) return out;
        } catch (err) {
            return logger.error(err);
        }
    }

    public static addCommand(command: Command) {
        this.commands.push(command);
    }

    constructor(
        public aliases: string[],
        public usage: string,
        public callback: (msg: {
            a: string;
            cmd: string;
            args: string[];
        }) => Promise<void | string> | void | string
    ) {}
}

Command.addCommand(
    new Command(["memory", "mem"], "mem", msg => {
        const mem = process.memoryUsage();
        return `Memory: ${(mem.heapUsed / 1000 / 1000).toFixed(2)} MB used / ${(
            mem.heapTotal /
            1000 /
            1000
        ).toFixed(2)} MB total`;
    })
);

rl.on("line", async line => {
    const out = await Command.handleCommand(line);
    logger.info(out);
    rl.prompt();
});

rl.on("SIGINT", () => {
    process.exit();
});

(globalThis as unknown as any).rl = rl;
