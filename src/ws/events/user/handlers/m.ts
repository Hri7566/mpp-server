import { ServerEventListener } from "../../../../util/types";
import { eventGroups } from "../../../events";

export const m: ServerEventListener<"m"> = {
    id: "m",
    callback: (msg, socket) => {
        if (!msg.x || !msg.y) return;
        socket.setCursorPos(msg.x, msg.y);
    }
};
