import { findSocketByPartID } from "../ws/Socket";
import type Channel from "./Channel";

const onChannelUpdate = (channel: Channel) => {
    const info = channel.getInfo();
    const ppl = channel.getParticipantList();

    for (const partId of ChannelList.subscribers) {
        const socket = findSocketByPartID(partId);

        if (typeof socket == "undefined") {
            ChannelList.subscribers.splice(
                ChannelList.subscribers.indexOf(partId),
                1
            );
            return;
        }

        socket.sendChannelUpdate(info, ppl);
    }
};

export class ChannelList {
    private static list = new Array<Channel>();
    public static subscribers = new Array<string>();

    public static add(channel: Channel) {
        this.list.push(channel);
        channel.on("update", () => {
            onChannelUpdate(channel);
        });
    }

    public static remove(channel: Channel) {
        this.list.splice(this.list.indexOf(channel), 1);
    }

    public static getList() {
        return this.list;
    }
}
