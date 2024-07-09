import { ServerEventListener } from "../../../../util/types";

export const kickban: ServerEventListener<"kickban"> = {
    id: "kickban",
    callback: (msg, socket) => {
        // Kickbanning some asshole from channel
        if (typeof msg._id !== "string") return;
        if (typeof msg.ms !== "number") return;
        socket.kickban(msg._id, msg.ms);
    }
};
