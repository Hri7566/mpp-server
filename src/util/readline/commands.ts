import { ChannelList } from "../../channel/ChannelList";
import { deleteUser } from "../../data/user";
import Command from "./Command";

Command.addCommand(
    new Command(["help", "h", "commands", "cmds"], "help", msg => {
        if (!msg.args[1]) {
            return (
                "Commands: " +
                Command.commands.map(cmd => cmd.aliases[0]).join(" | ")
            );
        } else {
            let foundCommand: Command | undefined;

            for (const command of Command.commands) {
                for (const alias of command.aliases) {
                    if (msg.args[1] == alias) {
                        foundCommand = command;
                    }
                }
            }

            if (!foundCommand) return `No such command "${msg.args[1]}"`;
            return "Usage: " + foundCommand.usage;
        }
    })
);

Command.addCommand(
    new Command(["memory", "mem"], "memory", msg => {
        const mem = process.memoryUsage();
        return `Memory: ${(mem.heapUsed / 1000 / 1000).toFixed(2)} MB used / ${(
            mem.heapTotal /
            1000 /
            1000
        ).toFixed(2)} MB total`;
    })
);

Command.addCommand(
    new Command(["stop", "exit"], "stop", msg => {
        process.exit();
    })
);

Command.addCommand(
    new Command(["userdel", "deluser"], "userdel <id>", async msg => {
        await deleteUser(msg.args[1]);
    })
);

Command.addCommand(
    new Command(["list", "ls"], "list", async msg => {
        return (
            "Channels:\n- " +
            ChannelList.getList()
                .map(ch => ch.getID())
                .join("\n- ")
        );
    })
);
