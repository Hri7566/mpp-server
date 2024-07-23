import { ServerEventListener } from "../../../../util/types";

export const plus_ls: ServerEventListener<"+ls"> = {
    id: "+ls",
    callback: (msg, socket) => {
        // Give us the latest news on literally everything
        // that's happening in the server. In fact, I want
        // to know when someone clicks a button instantly,
        // so I can stalk other users by watching the room
        // count go up somewhere else when I watch someone
        // leave the channel I'm reading their messages in
        // and when I see their cursor disappear I'll know
        // precisely where they went to follow them and to
        // annoy them in chat when I see them again.
        if (socket.rateLimits) {
            if (!socket.rateLimits.normal["+ls"].attempt()) return;
        }

        socket.subscribeToChannelList();
    }
};
