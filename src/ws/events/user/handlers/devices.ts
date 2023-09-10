import { ServerEventListener } from "../../../../util/types";

export const devices: ServerEventListener<"devices"> = {
    id: "devices",
    callback: (msg, socket) => {
        socket.gateway.hasSentDevices = true;
    }
};
