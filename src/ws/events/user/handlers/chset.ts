import { ServerEventListener } from "../../../../util/types";

export const chset: ServerEventListener<"chset"> = {
    id: "chset",
    callback: async (msg, socket) => {
        // Change channel settings
        if (socket.rateLimits)
            if (!socket.rateLimits.chains.chset.attempt()) return;

        if (typeof msg.set == "undefined") return;

        const ch = socket.getCurrentChannel();
        if (!ch) return;

        // Edit room now
        ch.changeSettings(msg.set, false);
    }
};
