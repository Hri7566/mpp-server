import { ServerEventListener } from "../../../../util/types";

export const hi: ServerEventListener<"b"> = {
    id: "b",
    callback: (msg, socket) => {
        // Antibot message
    }
};
