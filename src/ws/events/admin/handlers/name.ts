import { ChannelList } from "../../../../channel/ChannelList";
import { readUser, updateUser } from "../../../../data/user";
import { ServerEventListener } from "../../../../util/types";
import { findSocketsByUserID } from "../../../Socket";

export const name: ServerEventListener<"name"> = {
    id: "name",
    callback: async (msg, socket) => {
        // Change someone else's name but it's an annoying admin feature
        const id = msg._id;
        const name = msg.name;

        if (typeof id !== "string") return;
        if (typeof name !== "string") return;

        const user = await readUser(msg._id);
        if (!user) return;

        user.name = name;
        await updateUser(id, user);

        for (const ch of ChannelList.getList()) {
            ch.emit("user data update", user);
        }
    }
};
