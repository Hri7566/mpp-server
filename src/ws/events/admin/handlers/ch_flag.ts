import { ChannelList } from "../../../../channel/ChannelList";
import { ServerEventListener } from "../../../../util/types";

export const ch_flag: ServerEventListener<"ch_flag"> = {
    id: "ch_flag",
    callback: async (msg, socket) => {
        // Edit channel flag
        let chid = msg._id;

        if (typeof chid !== "string") {
            const ch = socket.getCurrentChannel();
            if (!ch) return;

            chid = ch.getID();
        }

        const ch = ChannelList.getList().find(c => c.getID() == chid);
        if (!ch) return;
    }
};
