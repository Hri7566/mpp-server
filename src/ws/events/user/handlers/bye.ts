import { ServerEventListener } from "../../../../util/types";

export const bye: ServerEventListener<"bye"> = {
    id: "bye",
    callback: (msg, socket) => {
        // Leave server
        if (socket.rateLimits)
            if (!socket.rateLimits.normal.bye.attempt()) return;

        socket.destroy();
    }
};
