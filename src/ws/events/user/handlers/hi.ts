import { ServerEventListener } from "../../../../util/types";

export const hi: ServerEventListener<"hi"> = {
    id: "hi",
    callback: (msg, socket) => {
        // Handshake message
        // TODO Hi message tokens

        if (socket.rateLimits)
            if (!socket.rateLimits.normal.hi.attempt()) return;

        if (socket.gateway.hasProcessedHi) return;
        let part = socket.getParticipant();

        if (!part) {
            part = {
                _id: socket.getUserID(),
                name: "Anonymous",
                color: "#777",
                id: ""
            };
        }

        socket.sendArray([
            {
                m: "hi",
                accountInfo: undefined,
                permissions: undefined,
                t: Date.now(),
                u: {
                    _id: part._id,
                    color: part.color,
                    name: part.name
                }
            }
        ]);

        socket.gateway.hasProcessedHi = true;
    }
};
