import { ChannelList } from "../../../../channel/ChannelList";
import { readUser, updateUser } from "../../../../data/user";
import { ServerEventListener } from "../../../../util/types";
import { findSocketsByUserID } from "../../../Socket";
import { config } from "../../../usersConfig";

export const eval_msg: ServerEventListener<"eval"> = {
    id: "eval",
    callback: async (msg, socket) => {
        // Evaluate a JavaScript expression
        if (!config.enableAdminEval) return;
        if (typeof msg.str !== "string") return;
        socket.eval(msg.str);
    }
};
