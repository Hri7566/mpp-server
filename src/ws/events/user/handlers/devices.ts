import { ServerEventListener } from "../../../../util/types";

export const devices: ServerEventListener<"devices"> = {
    id: "devices",
    callback: (msg, socket) => {
        // List of MIDI Devices (or software ports, because nobody can tell the difference)
        if (socket.gateway.hasSentDevices) return;
        socket.gateway.hasSentDevices = true;
    }
};
