import { ServerEventListener } from "../../../../util/types";

export const userset: ServerEventListener<"userset"> = {
    id: "userset",
    callback: (msg, socket) => {
        // Change username/color
        socket.userset(msg.set.name, msg.set.color);
    }
};
