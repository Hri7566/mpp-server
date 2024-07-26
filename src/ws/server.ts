import { Logger } from "../util/Logger";
import { createSocketID, createUserID } from "../util/id";
import fs from "fs";
import path from "path";
import { handleMessage } from "./message";
import { Socket, socketsBySocketID } from "./Socket";
import env from "../util/env";
import { getMOTD } from "../util/motd";
import nunjucks from "nunjucks";

const logger = new Logger("WebSocket Server");

/**
 * Get a rendered version of the index file
 * @returns Response with html in it
 */
async function getIndex() {
    // This tiny function took like an hour to write because
    // nobody realistically uses templates in 2024 and documents
    // it well enough to say what library they used

    const index = Bun.file("./public/index.html");

    const rendered = nunjucks.renderString(await index.text(), {
        motd: getMOTD()
    });

    const response = new Response(rendered);
    response.headers.set("Content-Type", "text/html");

    return response;
}

export const app = Bun.serve<{ ip: string }>({
    port: env.PORT,
    hostname: "0.0.0.0",
    fetch: (req, server) => {
        const reqip = server.requestIP(req);
        if (!reqip) return;
        const ip = req.headers.get("x-forwarded-for") || reqip.address;

        if (
            server.upgrade(req, {
                data: {
                    ip
                }
            })
        ) {
            return;
        } else {
            const url = new URL(req.url).pathname;

            // lol
            // const ip = decoder.decode(res.getRemoteAddressAsText());
            // logger.debug(`${req.getMethod()} ${url} ${ip}`);
            // res.writeStatus(`200 OK`).end("HI!");

            // I have no clue if this is even safe...
            // wtf do I do when the user types "/../.env" in the URL?
            // From my testing, nothing out of the ordinary happens...
            // but just in case, if you find something wrong with URLs,
            // this is the most likely culprit

            const file = path.join("./public/", url);

            // Time for unreadable blocks of confusion
            try {
                if (fs.lstatSync(file).isFile()) {
                    const data = Bun.file(file);

                    if (data) {
                        return new Response(data);
                    } else {
                        return getIndex();
                    }
                } else {
                    return getIndex();
                }
            } catch (err) {
                return getIndex();
            }
        }
    },
    websocket: {
        open: ws => {
            // We got one!
            const socket = new Socket(ws, createSocketID());

            // Reel 'em in...
            (ws as unknown as any).socket = socket;
            // logger.debug("Connection at " + socket.getIP());

            // Let's put it in the dinner bucket.
            socketsBySocketID.set((socket.socketID as any), socket);
        },

        message: (ws, message) => {
            // "Let's make it binary" said all websocket developers for some reason
            const msg = message.toString();

            // Let's find out wtf they even sent
            handleMessage((ws as unknown as any).socket, msg);
        },

        close: (ws, code, message) => {
            // logger.debug("Close called");

            // This usually gets called when someone leaves,
            // but it's also used internally just in case
            // some dickhead can't close their tab like a
            // normal person.

            const socket = (ws as unknown as any).socket as Socket;
            if (socket) {
                socket.destroy();

                for (const sockID of socketsBySocketID.keys()) {
                    const sock = socketsBySocketID.get(sockID);

                    if (sock == socket) {
                        socketsBySocketID.delete(sockID);
                    }
                }
            }
        }
    }
});

logger.info("Listening on port", env.PORT);
