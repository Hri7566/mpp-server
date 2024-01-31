import { ServerEventListener } from "../../../../util/types";

export const minus_ls: ServerEventListener<"-ls"> = {
    id: "-ls",
    callback: (msg, socket) => {
        // Stop giving us the latest server forecast
        socket.unsubscribeFromChannelList();
    }
};
