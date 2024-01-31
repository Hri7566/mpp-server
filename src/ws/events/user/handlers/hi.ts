import { ServerEventListener } from "../../../../util/types";

export const hi: ServerEventListener<"hi"> = {
    id: "hi",
    callback: (msg, socket) => {
        // Handshake message
        // TODO Hi message tokens
        // I'm not actually sure if I'm up for doing tokens,
        // but if someone wants to submit a pull request, I
        // look forward to watching you do all the work
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
