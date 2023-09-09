import { ServerEventListener } from "../../../../util/types";
import { eventGroups } from "../../../events";

export const color: ServerEventListener<"color"> = {
    id: "color",
    callback: (msg, socket) => {
        // TODO color
    }
};
