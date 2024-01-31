import { ServerEventListener } from "../../../../util/types";

export const t: ServerEventListener<"t"> = {
    id: "t",
    callback: (msg, socket) => {
        // Ping
        if (msg.e) {
            if (typeof msg.e !== "number") return;
        }

        // Pong!
        socket.sendArray([
            {
                m: "t",
                t: Date.now(),
                e: typeof msg.e == "number" ? msg.e : undefined
            }
        ]);
    }
};
