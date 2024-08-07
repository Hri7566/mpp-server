import { ChannelList } from "../../channel/ChannelList";
import { deleteUser, getUsers } from "../../data/user";
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
        return `Memory: ${(mem.heapUsed / 1000 / 1000).toFixed(2)} MB / ${(
            mem.heapTotal /
            1000 /
            1000
        ).toFixed(2)} MB / ${(mem.rss / 1000 / 1000).toFixed(2)} MB`;
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
    new Command(["list", "ls"], "list <channels, users>", async msg => {
        if (msg.args.length > 1) {
            if (msg.args[1] == "channels") {
                return (
                    "Channels:\n- " +
                    ChannelList.getList()
                        .map(ch => ch.getID())
                        .join("\n- ")
                );
            } else if (msg.args[1] == "users") {
                var user = getUsers();
                var users = "";
                (await user).users.forEach(u => {
                    users += `\n- [${u.id}]: ${u.name}`;
                });

                return "Users: " + (await (await user).count) + users;
            } else {
                return "list <channels, users>";
            }
        } else {
            return "list <channels, users>";
        }
    })
);

Command.addCommand(
    new Command(["js", "eval"], "js <code>", async msg => {
        function roughSizeOfObject(object: any) {
            const objectList: any[] = [];
            const stack = [object];
            let bytes = 0;

            while (stack.length) {
                const value = stack.pop();

                switch (typeof value) {
                    case 'boolean':
                        bytes += 4;
                        break;
                    case 'string':
                        bytes += value.length * 2;
                        break;
                    case 'number':
                        bytes += 8;
                        break;
                    case 'object':
                        if (!objectList.includes(value)) {
                            objectList.push(value);
                            for (const prop in value) {
                                if (value.hasOwnProperty(prop)) {
                                    stack.push(value[prop]);
                                }
                            }
                        }
                        break;
                }
            }

            return bytes;
        }
        if (msg.args.length > 1) {
            try {
                const output = eval(msg.args[1]);
                return output;
            } catch (err) {
                return err;
            }
        }
    })
);
