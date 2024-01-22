import env from "../../../../util/env";
import { ServerEventListener } from "../../../../util/types";
import { config } from "../../../usersConfig";

export const admin_message: ServerEventListener<"admin message"> = {
    id: "admin message",
    callback: (msg, socket) => {
        if (typeof msg.password !== "string") return;
        if (msg.password !== env.ADMIN_PASS) return;
        socket.admin.emit(msg.msg.m, msg.msg, socket, true);
    }
};
