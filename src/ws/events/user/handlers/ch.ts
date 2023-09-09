import { ServerEventListener } from "../../../../util/types";
import { eventGroups } from "../../../events";

export const ch: ServerEventListener<"ch"> = {
    id: "ch",
    callback: (msg, socket) => {
        // Switch channel
        if (!msg._id) return;
        socket.setChannel(msg._id, msg.set);
    }
};
