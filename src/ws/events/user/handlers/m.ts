import { ServerEventListener } from "../../../../util/types";

export const m: ServerEventListener<"m"> = {
    id: "m",
    callback: (msg, socket) => {
        // Cursor movement
        if (!socket.rateLimits?.normal.m.attempt()) return;
        if (!msg.x || !msg.y) return;
        socket.setCursorPos(msg.x, msg.y);
    }
};
