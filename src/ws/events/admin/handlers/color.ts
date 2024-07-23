import { ChannelList } from "../../../../channel/ChannelList";
import { readUser, updateUser } from "../../../../data/user";
import { ServerEventListener } from "../../../../util/types";
import { Logger } from "../../../../util/Logger";

export const color: ServerEventListener<"color"> = {
    id: "color",
    callback: async (msg, socket) => {
        const id = msg._id;
        const color = msg.color;

        if (typeof id !== "string") return;
        if (typeof color !== "string") return;

        const user = await readUser(msg._id);
        if (!user) return;

        user.color = color;
        await updateUser(id, user);

        for (const ch of ChannelList.getList()) {
            ch.emit("user data update", user);
        }
    }
};
