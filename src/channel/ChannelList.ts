import { type Socket, findSocketByPartID } from "../ws/Socket";
import type Channel from "./Channel";

const onChannelUpdate = (channel: Channel) => {
    // If this shit ever manages to handle over 10 people I'd be impressed
    const info = channel.getInfo();
    // const ppl = channel.getParticipantList();
    if (info.settings.visible !== true) return;

    for (const partId of ChannelList.subscribers) {
        const socket = findSocketByPartID(partId);

        if (typeof socket == "undefined") {
            ChannelList.subscribers.splice(
                ChannelList.subscribers.indexOf(partId),
                1
            );
            return;
        }

        socket.sendChannelList([info], false);
    }
};

export class ChannelList {
    private static list = new Array<Channel>();
    public static subscribers = new Array<string>();

    public static add(channel: Channel) {
        this.list.push(channel);
        channel.on("update", onChannelUpdate);
    }

    public static remove(channel: Channel) {
        this.list.splice(this.list.indexOf(channel), 1);
        channel.off("update", onChannelUpdate);
    }

    public static getList() {
        return this.list;
    }

    public static getPublicList() {
        return this.list.filter(ch => ch.getSetting("visible") == true);
    }

    public static subscribe(partId: Socket["id"]) {
        this.subscribers.push(partId);
    }

    public static unsubscribe(partId: Socket["id"]) {
        this.subscribers.splice(this.subscribers.indexOf(partId), 1);
    }
}
