import { Logger } from "../../../../util/Logger";
import { generateToken, verifyToken } from "../../../../util/token";
import { ClientEvents, ServerEventListener } from "../../../../util/types";
import { config } from "../../../usersConfig";

const logger = new Logger("Hi handler");

export const hi: ServerEventListener<"hi"> = {
    id: "hi",
    callback: async (msg, socket) => {
        // Handshake message
        if (socket.rateLimits)
            if (!socket.rateLimits.normal.hi.attempt()) return;

        if (socket.gateway.hasProcessedHi) return;

        let generatedToken: string | undefined;

        // Browser challenge
        if (config.browserChallenge == "basic") {
            if (typeof msg.code !== "boolean") return;

            if (msg.code === true) {
                socket.gateway.hasCompletedBrowserChallenge = true;
            }
        } else if (config.browserChallenge == "obf") {
            // TODO
        }

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
                const verified = await verifyToken(msg.token);
            } else {
                // Generate a token
                generatedToken = await generateToken(socket.getUserID());
                if (!generatedToken) return;
            }

            logger.debug("token:", generatedToken);
        }

        let part = socket.getParticipant();

        if (!part) {
            part = {
                _id: socket.getUserID(),
                name: "Anonymous",
                color: "#777",
                id: ""
            };
        }

        const m = {
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

        logger.debug("Hi message:", m);

        socket.sendArray([m as ClientEvents["hi"]]);

        socket.gateway.hasProcessedHi = true;
    }
};
