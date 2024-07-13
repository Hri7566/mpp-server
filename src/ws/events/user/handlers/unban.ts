import { ServerEventListener } from "../../../../util/types";

export const unban: ServerEventListener<"unban"> = {
    id: "unban",
    callback: (msg, socket) => {
        // Kickbanning someone from channel
        if (typeof msg._id !== "string") return;

        if (socket.rateLimits)
            if (!socket.rateLimits.normal.unban.attempt()) return;

        socket.unban(msg._id);
    }
};
