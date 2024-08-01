import { ServerEventListener } from "../../../../util/types";

export const m: ServerEventListener<"m"> = {
    id: "m",
    callback: async (msg, socket) => {
        // Cursor movement
        if (socket.rateLimits) {
            if (!socket.rateLimits.normal.m.attempt()) return;
        }

        if (!msg.x || !msg.y) return;

        let x = msg.x;
        let y = msg.y;

        // Make it numbers
        if (typeof msg.x == "string") x = parseFloat(msg.x);
        if (typeof msg.y == "string") y = parseFloat(msg.y);

        // Move the laggy piece of shit
        socket.setCursorPos(x, y);
    }
};
