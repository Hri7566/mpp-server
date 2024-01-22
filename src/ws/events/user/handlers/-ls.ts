import { ServerEventListener } from "../../../../util/types";

export const minus_ls: ServerEventListener<"-ls"> = {
    id: "-ls",
    callback: (msg, socket) => {
        socket.unsubscribeFromChannelList();
    }
};
