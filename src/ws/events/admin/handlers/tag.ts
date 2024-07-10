import { readUser, updateUser } from "../../../../data/user";
import { ServerEventListener } from "../../../../util/types";
import { findSocketsByUserID } from "../../../Socket";

export const tag: ServerEventListener<"tag"> = {
    id: "tag",
    callback: async (msg, socket) => {
        // Change someone else's tag
        const id = msg._id;
        const tag = msg.tag;

        if (typeof id !== "string") return;
        if (typeof tag !== "object") return;
        if (typeof tag["text"] !== "string") return;
        if (typeof tag.color !== "string") return;
        if (!tag.color.match(/^#[0-9a-f]{6}$/i)) return;

        const user = await readUser(msg._id);
        if (!user) return;

        user.tag = JSON.stringify(tag);
        await updateUser(id, user);

        const toUpdate = findSocketsByUserID(id);
        toUpdate.forEach(s => {
            s.setTag(msg.tag.text, msg.tag.color);
        });
    }
};
