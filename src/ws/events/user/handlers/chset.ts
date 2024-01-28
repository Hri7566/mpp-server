import { ServerEventListener } from "../../../../util/types";

export const chset: ServerEventListener<"chset"> = {
    id: "chset",
    callback: (msg, socket) => {
        // Change channel settings
        if (typeof msg.set == "undefined") return;
        const ch = socket.getCurrentChannel();
        if (!ch) return;
        ch.changeSettings(msg.set, false);
    }
};
