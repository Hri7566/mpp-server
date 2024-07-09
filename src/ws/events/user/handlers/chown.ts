import { Logger } from "../../../../util/Logger";
import { ServerEventListener } from "../../../../util/types";

const logger = new Logger("chown");

export const chown: ServerEventListener<"chown"> = {
    id: "chown",
    callback: (msg, socket) => {
        // Change channel ownership
        const ch = socket.getCurrentChannel();
        if (!ch) return;

        if (!ch.crown) {
            // TODO Crown admin stuff
        } else {
            if (!ch.crown.canBeSetBy(socket)) return;

            // This user may not always exist,
            // but sometimes we don't provide a user
            // to drop the crown
            let heir = ch.getParticipantList().find(p => p.id == msg.id);
            ch.chown(heir);
        }
    }
};
