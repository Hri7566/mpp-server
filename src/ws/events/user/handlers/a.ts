import { ServerEventListener } from "../../../../util/types";

export const a: ServerEventListener<"a"> = {
    id: "a",
    callback: (msg, socket) => {
        // Chat message
        const flags = socket.getUserFlags();
        if (!flags) return;

        // Why did I write this statement so weird
        if (!flags["no chat rate limit"] || flags["no chat rate limit"] == 0)
            if (!socket.rateLimits?.normal.a.attempt()) return;
        const ch = socket.getCurrentChannel();
        if (!ch) return;

        // msg.m
        // Permission denied: msg.m
        // sudo msg.m
        ch.emit("message", msg, socket);
    }
};
