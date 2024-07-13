import type { Channel } from "../../../../channel";
import { ChannelList } from "../../../../channel/ChannelList";
import { ServerEventListener } from "../../../../util/types";

export const admin_chat: ServerEventListener<"admin_chat"> = {
    id: "admin_chat",
    callback: async (msg, socket) => {
        // Send a message in chat as an admin
        let ch: Channel | undefined;

        if (typeof msg._id == "string") {
            for (const channel of ChannelList.getList()) {
                if (channel.getID() !== msg._id) continue;
                ch = channel;
            }
        } else {
            ch = socket.getCurrentChannel();
        }

        if (!ch) return;
        ch.sendChatAdmin(msg.message);
    }
};
