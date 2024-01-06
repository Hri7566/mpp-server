import { ServerEventListener } from "../../../../util/types";

export const m: ServerEventListener<"m"> = {
    id: "m",
    callback: (msg, socket) => {
        // Cursor movement
        if (!socket.rateLimits?.normal.m.attempt()) return;
        if (!msg.x || !msg.y) return;

        let x = msg.x;
        let y = msg.y;

        if (typeof msg.x == "string") x = parseFloat(msg.x);
        if (typeof msg.y == "string") y = parseFloat(msg.y);

        socket.setCursorPos(x, y);
    }
};
