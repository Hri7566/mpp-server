import { Logger } from "../../../../util/Logger";
import { ServerEventListener } from "../../../../util/types";

const logger = new Logger("chown");

export const chown: ServerEventListener<"chown"> = {
    id: "chown",
    callback: (msg, socket) => {
        // Change channel ownership
        if (typeof msg.id == "undefined") return;


        const ch = socket.getCurrentChannel();
        if (!ch) return;

        if (!socket.isOwner()) return;

        if (!ch.crown) {
            // TODO Crown admin stuff
        } else {
            if (!ch.crown.canBeSetBy(socket)) return;

            const heir = ch.getParticipantList().find(p => p.id == msg.id);
            if (!heir) return;

            ch.chown(heir);
        }
    }
};
