import logger from "./logger";

export class Command {
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

export default Command;
