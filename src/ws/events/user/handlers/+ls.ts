import { ServerEventListener } from "../../../../util/types";

export const plus_ls: ServerEventListener<"+ls"> = {
    id: "+ls",
    callback: (msg, socket) => {
        socket.subscribeToChannelList();
    }
};
