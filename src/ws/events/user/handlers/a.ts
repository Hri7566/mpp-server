import { ServerEventListener } from "../../../../util/types";

export const a: ServerEventListener<"a"> = {
    id: "a",
    callback: (msg, socket) => {
        // Chat message
        if (!socket.rateLimits?.normal.a.attempt()) return;
        const ch = socket.getCurrentChannel();
        if (!ch) return;

        ch.emit("message", msg, socket);
    }
};
