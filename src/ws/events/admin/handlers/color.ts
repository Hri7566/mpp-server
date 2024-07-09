import { readUser, updateUser } from "../../../../data/user";
import { ServerEventListener } from "../../../../util/types";
import { findSocketsByUserID } from "../../../Socket";

export const color: ServerEventListener<"color"> = {
    id: "color",
    callback: async (msg, socket) => {
        // I'm not allowed to use this feature on MPP.net for a really stupid reason
        // Nevermind, fishing bot has color again
        const id = msg._id;
        const color = msg.color;

        if (typeof id !== "string") return;
        if (typeof color !== "string") return;

        const user = await readUser(msg._id);
        if (!user) return;

        user.color = color;
        await updateUser(id, user);

        const toUpdate = findSocketsByUserID(id);
        toUpdate.forEach(s => {
            s.userset(undefined, msg.color, true);
        });
    }
};
