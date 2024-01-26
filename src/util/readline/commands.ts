import Command from "./Command";

Command.addCommand(
    new Command(["help", "h", "commands", "cmds"], "help", msg => {
        return (
            "Commands: " +
            Command.commands.map(cmd => cmd.aliases[0]).join(" | ")
        );
    })
);

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

Command.addCommand(
    new Command(["stop", "exit"], "stop", msg => {
        process.exit();
    })
);
