import { generateToken } from "../../../../util/token";
import { ServerEventListener } from "../../../../util/types";
import { config } from "../../../usersConfig";

export const hi: ServerEventListener<"hi"> = {
    id: "hi",
    callback: async (msg, socket) => {
        // Handshake message

        let generatedToken: string | undefined;

        if (config.tokenAuth !== "none") {
            if (socket.gateway.hasCompletedBrowserChallenge) {
                if (msg.token) {
                    // Check if they have passed the browser challenge
                    // Send the token to the authenticator
                    // TODO
                } else {
                    // Generate a token
                    generatedToken = await generateToken(socket.getUserID()) as string | undefined;
                    if (!generatedToken) return;
                }
            } else {
                // TODO Ban the user for logging in without the browser
                // TODO config for this
            }
        }

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
