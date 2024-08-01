import { ChannelList } from "../../../../channel/ChannelList";
import { loadConfig } from "../../../../util/config";
import { ServerEventListener } from "../../../../util/types";
import { socketsBySocketID } from "../../../Socket";

const config = loadConfig<{
    allowXSS: boolean;
    maxDuration: number;
    defaultDuration: number;
    allTarget: string;
}>("config/notifications.yml", {
    allowXSS: true,
    maxDuration: 60000,
    defaultDuration: 7000,
    allTarget: "all"
});

export const notification: ServerEventListener<"notification"> = {
    id: "notification",
    callback: async (msg, socket) => {
        // Send notification to user/channel
        if (typeof msg.targetChannel == "undefined" && typeof msg.targetUser == "undefined") return;

        if (msg.duration) {
            if (msg.duration > config.maxDuration) msg.duration = config.maxDuration;
        } else {
            msg.duration = config.defaultDuration;
        }

        if (typeof msg.targetChannel !== "undefined") {
            for (const ch of ChannelList.getList().values()) {
                if (ch.getID() == msg.targetChannel || msg.targetChannel == config.allTarget) {
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
