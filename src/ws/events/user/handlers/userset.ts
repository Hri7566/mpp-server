import { ServerEventListener } from "../../../../util/types";

export const userset: ServerEventListener<"userset"> = {
    id: "userset",
    callback: (msg, socket) => {
        // Change username/color
        if (!socket.rateLimits?.chains.userset.attempt()) return;
        if (!msg.set.name && !msg.set.color) return;
        socket.userset(msg.set.name, msg.set.color);
    }
};
