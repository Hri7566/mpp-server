import { forceloadChannel } from "../../../../channel/forceLoad";
import { ServerEventListener } from "../../../../util/types";

export const forceload: ServerEventListener<"forceload"> = {
    id: "forceload",
    callback: async (msg, socket) => {
        // Forceload channel
        if (typeof msg._id !== "string") return;

        forceloadChannel(msg._id);
    }
};
