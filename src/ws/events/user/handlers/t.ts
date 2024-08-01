import { ServerEventListener } from "../../../../util/types";

export const t: ServerEventListener<"t"> = {
    id: "t",
    callback: async (msg, socket) => {
        // Ping

        if (socket.rateLimits)
            if (!socket.rateLimits.normal.t.attempt()) return

        if (msg.e) {
            if (typeof msg.e !== "number") return;
        }

        // Pong
        socket.sendArray([
            {
                m: "t",
                t: Date.now(),
                e: typeof msg.e == "number" ? msg.e : undefined
            }
        ]);
    }
};
