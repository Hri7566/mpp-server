import { Logger } from "../../../../util/Logger";
import { generateToken } from "../../../../util/token";
import { ServerEventListener } from "../../../../util/types";
import { config } from "../../../usersConfig";

const logger = new Logger("Hi handler");

export const hi: ServerEventListener<"hi"> = {
    id: "hi",
    callback: async (msg, socket) => {
        // Handshake message

        let generatedToken: string | undefined;

        // Is the browser challenge enabled and has the user completed it?
        if (config.browserChallenge !== "none" && !socket.gateway.hasCompletedBrowserChallenge) return;

        // Is token auth enabled?
        if (config.tokenAuth !== "none") {
            logger.debug("token auth is enabled");

            // Is the browser challenge enabled and has the user completed it?
            if (msg.token) {
                // Check if they have passed the browser challenge
                // Send the token to the authenticator
                // TODO
            } else {
                // Generate a token
                generatedToken = await generateToken(socket.getUserID());
                if (!generatedToken) return;
            }

            logger.debug("token:", generatedToken);
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
                },
                token: generatedToken
            }
        ]);

        socket.gateway.hasProcessedHi = true;
    }
};
