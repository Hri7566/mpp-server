import { ServerEventListener } from "../../../../util/types";

export const kickban: ServerEventListener<"kickban"> = {
    id: "kickban",
    callback: (msg, socket) => {
        // Kickbanning someone from channel
        if (typeof msg._id !== "string") return;
        if (typeof msg.ms !== "number") return;

        if (socket.rateLimits)
            if (!socket.rateLimits.normal.kickban.attempt()) return;

        socket.kickban(msg._id, msg.ms);
    }
};
