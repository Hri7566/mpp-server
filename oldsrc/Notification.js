const Server = require("./Server");

module.exports = class Notification {
    constructor(server, data) {
        this.server = server;
        this.cl = data.cl;

        this.id = data.id;
        this.title = data.title;
        this.text = data.text;
        this.html = data.html;
        this.target = data.target;
        this.duration = data.duration;
        this.class = data.class;
        this.targetChannel = data.targetChannel;
        this.targetUser = data.targetUser;

        this.chat = data.chat;
    }

    send() {
        let msg = {
            m: "notification",
            id: this.id,
            title: this.title,
            text: this.text,
            html: this.html,
            target: this.target,
            duration: this.duration,
            class: this.class
        };

        // Object.assign(msg, this);
        const targets = [];

        if (this.targetChannel) {
            switch (this.targetChannel) {
                case "all":
                    // every channel
                    for (const cl of this.server.connections.values()) {
                        targets.push(cl);
                    }
                    break;
                case "room":
                case "channel":
                    // current channel
                    if (!this.cl) break;
                    if (!this.cl.channel) break;
                    for (const cl of this.server.connections.values()) {
                        if (!cl.channel) continue;
                        if (cl.channel._id == this.cl.channel._id) {
                            targets.push(cl);
                        }
                    }
                    break;
                default:
                    // specific channel
                    for (const cl of this.server.connections.values()) {
                        if (!cl.channel) continue;
                        if (cl.channel._id == this.targetChannel) {
                            targets.push(cl);
                        }
                    }
                    break;
            }
        }

        if (!this.chat) {
            for (const cl of targets) {
                if (this.targetUser) {
                    if (!cl.user) continue;
                    if (
                        cl.user._id == this.targetUser ||
                        cl.participantId == this.targetUser
                    )
                        cl.sendArray([msg]);
                } else {
                    cl.sendArray([msg]);
                }
            }
        } else {
            this.cl.sendChat(this.text);
        }
    }
};
