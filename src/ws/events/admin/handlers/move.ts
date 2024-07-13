import { ServerEventListener } from "../../../../util/types";
import { socketsBySocketID } from "../../../Socket";

export const move: ServerEventListener<"move"> = {
    id: "move",
    callback: async (msg, socket) => {
        // Forcefully move user to another channel
        let id = msg._id;
        if (!id) id = socket.getUserID();

        const ch = msg.ch;
        const set = msg.set;

        if (typeof ch !== "string") return;
        if (typeof set !== "object" && typeof set !== "undefined") return;

        // Loop through every socket
        for (const sock of socketsBySocketID.values()) {
            // Check their user ID
            if (sock.getUserID() == id) {
                // Forcefully move to channel
                sock.setChannel(ch, set, true);
            }
        }
    }
};
