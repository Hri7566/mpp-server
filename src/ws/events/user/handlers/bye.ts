import { ServerEventListener } from "../../../../util/types";

export const bye: ServerEventListener<"bye"> = {
    id: "bye",
    callback: (msg, socket) => {
        // Leave server
        socket.destroy();
    }
};
