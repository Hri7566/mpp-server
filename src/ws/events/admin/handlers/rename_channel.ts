import { ChannelList } from "../../../../channel/ChannelList";
import { ServerEventListener } from "../../../../util/types";
import { socketsBySocketID } from "../../../Socket";

export const rename_channel: ServerEventListener<"rename_channel"> = {
    id: "rename_channel",
    callback: async (msg, socket) => {
        // Rename a channel by changing its ID
        if (typeof msg._id !== "string") return;

        const ch = socket.getCurrentChannel();
        if (!ch) return;


        const oldID = socket.currentChannelID;

        // We have to check if the desired ID exists already,
        // and if it does, we'll merge the channels by forcing
        // the users to join the new one, otherwise we'll just
        // change the ID of the original channel and push an
        // update event to propogate the changes to the clients.

        let found;

        for (const channel of ChannelList.getList()) {
            if (msg._id == channel.getID()) {
                found = channel;
            }
        }

        // Have we found a channel?
        if (!found) {
            // Not found, so it's safe to take up that ID
            ch.setID(msg._id);
        } else {
            // Found, avoid jank by magically disappearing
            ch.destroy();
        }

        for (const sock of socketsBySocketID.values()) {
            // Are they in this channel?
            if (sock.currentChannelID !== oldID) continue;
            // Move them forcefully
            sock.setChannel(msg._id, undefined, true);
        }
    }
};
