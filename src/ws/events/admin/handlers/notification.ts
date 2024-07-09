import { ChannelList } from "../../../../channel/ChannelList";
import { ServerEventListener } from "../../../../util/types";
import { socketsBySocketID } from "../../../Socket";

export const notification: ServerEventListener<"notification"> = {
    id: "notification",
    callback: async (msg, socket) => {
        // Send notification to user/channel
        if (typeof msg.targetChannel == "undefined" && typeof msg.targetUser == "undefined") return;

        if (typeof msg.targetChannel !== "undefined") {
            for (const ch of ChannelList.getList().values()) {
                if (ch.getID() == msg.targetChannel) {
                    ch.sendNotification(msg);
                }
            }
        }

        if (typeof msg.targetUser !== "undefined") {
            for (const socket of socketsBySocketID.values()) {
                if (socket.getUserID() == msg.targetUser) {
                    socket.sendNotification(msg);
                }
            }
        }
    }
};
