import { Logger } from "../../../../util/Logger";
import { getMOTD } from "../../../../util/motd";
import { createToken, getToken, validateToken } from "../../../../util/token";
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
        if (config.browserChallenge !== "none" && !socket.gateway.hasCompletedBrowserChallenge) return socket.ban(60000, "Browser challenge not completed");

        let token: string | undefined;
        let generatedToken = false;

        if (config.tokenAuth !== "none") {
            if (typeof msg.token !== "string") {
                // Get a saved token
                token = await getToken(socket.getUserID());
                if (typeof token !== "string") {
                    // Generate a new one
                    token = await createToken(socket.getUserID(), socket.gateway);

                    if (typeof token !== "string") {
                        logger.warn(`Unable to generate token for user ${socket.getUserID()}`);
                    } else {
                        generatedToken = true;
                    }
                }
            } else {
                // Validate the token
                const valid = await validateToken(socket.getUserID(), msg.token);
                if (!valid) {
                    //socket.ban(60000, "Invalid token");
                    //return;
                } else {
                    token = msg.token;
                }
            }
        }

        let part = socket.getParticipant();

        if (!part) {
            part = {
                _id: socket.getUserID(),
                name: "Anonymous",
                color: "#777",
                id: "",
                tag: undefined
            };
        }

        //logger.debug("Tag:", part.tag);

        socket.sendArray([{
            m: "hi",
            accountInfo: undefined,
            permissions: undefined,
            t: Date.now(),
            u: {
                _id: part._id,
                color: part.color,
                name: part.name,
                tag: part.tag
            },
            motd: getMOTD(),
            token
        }]);

        socket.gateway.hasProcessedHi = true;
    }
};
