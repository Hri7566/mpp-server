import { ServerEventListener } from "../../../../util/types";

export const userset: ServerEventListener<"userset"> = {
    id: "userset",
    callback: async (msg, socket) => {
        // Change username/color
        if (!socket.rateLimits?.chains.userset.attempt()) return;
        // You can disable color in the config because
        // Brandon's/jacored's server doesn't allow color changes,
        // and that's the OG server, but folks over at MPP.net
        // said otherwise because they're dumb roleplayers
        // or something and don't understand the unique value
        // of the fishing bot and how it allows you to change colors
        // without much control, giving it the feeling of value...
        // Kinda reminds me of crypto.
        // Also, Brandon's server had color changing on before.
        if (!msg.set.name && !msg.set.color) return;
        socket.userset(msg.set.name, msg.set.color);
    }
};
