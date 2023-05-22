const Logger = require("../Logger");
const Color = require("../Color");
const { Cow } = require("../Cow");

class Command {
    static commands = [];

    static logger = new Logger("Command Handler");

    static handleCommand(cl, ch, c, usedPrefix, args, argcat, p, isAdmin) {
        for (let cmd of this.commands) {
            let aliasCheck = false;

            aliasLoop: for (let alias of cmd.aliases) {
                if (c.toLowerCase() == alias.toLowerCase()) {
                    aliasCheck = true;
                    break aliasLoop;
                }
            }

            if (!aliasCheck) continue;
            if (!isAdmin && cmd.permLevel == "admin")
                return ch.adminChat(
                    `You don't have permission to use this command.`
                );
            if (args.length - 1 < cmd.minargs)
                return ch.adminChat(
                    `Not enough arguments. Usage: ${this.getUsage(
                        cmd.usage,
                        usedPrefix
                    )}`
                );

            try {
                const out = cmd.func(cl, ch, {
                    c,
                    args,
                    argcat,
                    p,
                    isAdmin,
                    a: args.join(" ")
                });
                console.log(out);
                if (!out) return;
                if (out !== "") {
                    ch.adminChat(out);
                }
            } catch (err) {
                this.logger.error(err);
                ch.adminChat(
                    `An error has occurred whilst performing this command.`
                );
            }
        }
    }

    static addCommand(cmd) {
        this.commands.push(cmd);
    }

    static getUsage(usa, pre) {
        return usa.split("%P").join(pre);
    }

    constructor(id, aliases, desc, usage, minargs, func, permLevel) {
        this.id = id;
        this.aliases = aliases || [id];
        this.desc = desc || "no description"; // brandon-like words
        this.usage = usage || "no usage";
        this.minargs = minargs;
        this.func = func;
        this.permLevel = permLevel || "admin"; // user / admin?
    }
}

Command.addCommand(
    new Command(
        "ping",
        ["ping"],
        undefined,
        `%Pping`,
        0,
        (cl, ch, msg) => {
            return `pong`;
        },
        "user"
    )
);

Command.addCommand(
    new Command(
        "color",
        ["color", "setcolor", "colorset"],
        undefined,
        `%Pcolor [color] [userid]`,
        0,
        (cl, ch, msg) => {
            if (!msg.isAdmin) {
                ch.adminChat("You do not have permission to use this command.");
                return;
            }

            let color = ch.verifyColor(msg.args[1]);
            if (color) {
                let c = new Color(color);
                if (!msg.args[2]) {
                    cl.emit(
                        "color",
                        {
                            color: c.toHexa(),
                            _id: cl.user._id
                        },
                        true
                    );
                    ch.adminChat(
                        `Your color is now ${c
                            .getName()
                            .replace("A", "a")} [${c.toHexa()}]`
                    );
                } else {
                    let winner = ch.server.getAllClientsByUserID(
                        msg.args[2]
                    )[0];
                    if (winner) {
                        cl.emit(
                            "color",
                            {
                                color: c.toHexa(),
                                _id: winner.user._id
                            },
                            true
                        );
                        ch.adminChat(
                            `Friend ${winner.user.name}'s color is now ${c
                                .getName()
                                .replace("A", "a")}.`
                        );
                    } else {
                        ch.adminChat(
                            "The friend you are looking for (" +
                                msg.args[2] +
                                ") is not around."
                        );
                    }
                }
            } else {
                ch.adminChat("Invalid color.");
            }
            ch.updateCh();
        },
        "user"
    )
);

Command.addCommand(
    new Command(
        "chlist",
        ["chlist"],
        undefined,
        `%Pchlist`,
        0,
        (cl, ch, msg) => {
            if (!msg.isAdmin) {
                ch.adminChat("You do not have permission to use this command.");
                return;
            }

            ch.adminChat("Channels:");

            for (const cc of cl.server.channels.values()) {
                ch.adminChat(`- ${cc._id}\n`);
            }
        },
        "admin"
    )
);

Command.addCommand(
    new Command(
        "cow",
        ["cow"],
        undefined,
        `%Pcow`,
        0,
        (cl, ch, msg) => {
            const cow = new Cow();
            return `Cow: ${cow.emoji}${cow.display_name}`;
        },
        "user"
    )
);

Command.addCommand(
    new Command(
        "id",
        ["id"],
        undefined,
        `%Pid`,
        0,
        (cl, ch, msg) => {
            return cl.user._id;
        },
        "user"
    )
);

Command.addCommand(
    new Command(
        "restart",
        ["restart"],
        undefined,
        `%Prestart`,
        0,
        (cl, ch, msg) => {
            if (!msg.isAdmin) {
                ch.adminChat("You do not have permission to use this command.");
                return;
            }

            cl.server.restart();
            Command.logger.log("Scheduled restart");
        },
        "admin"
    )
);

Command.addCommand(
    new Command(
        "restart",
        ["restart"],
        undefined,
        `%Prestart`,
        0,
        (cl, ch, msg) => {
            if (!msg.isAdmin) {
                ch.adminChat("You do not have permission to use this command.");
                return;
            }

            cl.server.restart();
            Command.logger.log("Scheduled restart");
        },
        "admin"
    )
);

module.exports = {
    Command
};
