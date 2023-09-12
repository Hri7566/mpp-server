import { ServerEventListener } from "../../../../util/types";
import { config } from "../../../usersConfig";

export const n: ServerEventListener<"n"> = {
    id: "n",
    callback: (msg, socket) => {
        // Piano note
        if (!Array.isArray(msg.n)) return;
        if (typeof msg.t !== "number") return;

        // Check note properties
        for (const n of msg.n) {
            if (typeof n.n != "string") return;

            // TODO Check for config.enableCustomNoteData here
            // For whatever reason, Bun likes to crash when we access that config object
            continue;

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

        // TODO Check crownsolo
        if (socket.noteQuota.spend(amount)) {
            socket.playNotes(msg);
        }
    }
};
