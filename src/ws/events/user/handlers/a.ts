import { ServerEventListener } from "../../../../util/types";

export const a: ServerEventListener<"a"> = {
    id: "a",
    callback: (msg, socket) => {
        // Send chat message
        const ch = socket.getCurrentChannel();
        if (!ch) return;

        ch.emit("message", msg, socket);
    }
};
