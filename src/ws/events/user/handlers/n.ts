import { ServerEventListener } from "../../../../util/types";
import { config } from "../../../usersConfig";

export const n: ServerEventListener<"n"> = {
    id: "n",
    callback: (msg, socket) => {
        // Piano note
        if (!Array.isArray(msg.n)) return;
        if (typeof msg.t !== "number") return;

        // This should've been here months ago
        const channel = socket.getCurrentChannel();
        if (!channel) return;

        // Check note properties
        for (const n of msg.n) {
            if (typeof n.n != "string") return;

            if (config.enableCustomNoteData) continue;

            if (n.s) {
                if (typeof n.s !== "number") return;
                if (n.s == 1) {
                    if (typeof n.d !== "number") return;
                    if (n.d < 0 || n.d > 200) return;

                    if (typeof n.v !== "number") return;
                    if (n.v < 0) n.v = 0;
                    if (n.v > 1) n.v = 1;
                }
            }
        }

        let amount = msg.n.length;

        const crownsolo = channel.getSetting("crownsolo");

        if ((crownsolo && socket.isOwner()) || !crownsolo) {
            // Shiny hat exists and we have shiny hat
            // or there is no shiny hat
            if (socket.noteQuota.spend(amount)) {
                // make noise
                socket.playNotes(msg);
            }
        }
    }
};
