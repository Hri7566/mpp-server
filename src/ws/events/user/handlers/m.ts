import { ServerEventListener } from "../../../../util/types";

export const m: ServerEventListener<"m"> = {
    id: "m",
    callback: (msg, socket) => {
        if (!msg.x || !msg.y) return;
        socket.setCursorPos(msg.x, msg.y);
    }
};
