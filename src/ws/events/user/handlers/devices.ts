import { ServerEventListener } from "../../../../util/types";
import { eventGroups } from "../../../events";

export const devices: ServerEventListener<"devices"> = {
    id: "devices",
    callback: (msg, socket) => {
        socket.gateway.hasSentDevices = true;
    }
};
