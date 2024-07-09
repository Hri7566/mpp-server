import { ServerEventListener } from "../../../../util/types";

export const clear_chat: ServerEventListener<"clear_chat"> = {
    id: "clear_chat",
    callback: async (msg, socket) => {
        // Reset chat in channel
        const ch = socket.getCurrentChannel();
        if (!ch) return;

        await ch.clearChat();
    }
};
