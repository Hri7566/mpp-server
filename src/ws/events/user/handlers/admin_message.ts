import { Logger } from "../../../../util/Logger";
import env from "../../../../util/env";
import { ServerEventListener } from "../../../../util/types";
import { config } from "../../../usersConfig";

const logger = new Logger("Admin Message Handler");

export const admin_message: ServerEventListener<"admin message"> = {
    id: "admin message",
    callback: (msg, socket) => {
        if (typeof msg.password !== "string") return;
        if (msg.password !== env.ADMIN_PASS) return;

        // Probably shouldn't be using password auth in 2024
        // Maybe I'll setup a dashboard instead some day
        socket.admin.emit(msg.msg.m, msg.msg, socket, true);
    }
};
