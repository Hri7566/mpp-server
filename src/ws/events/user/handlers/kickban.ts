import { ServerEventListener } from "../../../../util/types";

export const kickban: ServerEventListener<"kickban"> = {
    id: "kickban",
    callback: (msg, socket) => {
        // Kickban asshole from channel
        if (!msg._id) return;
        if (!msg.ms) return;
        socket.kickban(msg._id, msg.ms);
    }
};
