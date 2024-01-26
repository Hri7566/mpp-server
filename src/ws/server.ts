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

async function getIndex() {
    const index = Bun.file("./public/index.html");

    const rendered = nunjucks.renderString(await index.text(), {
        motd: getMOTD()
    });

    const response = new Response(rendered);
    response.headers.set("Content-Type", "text/html");
    return response;
}

export const app = Bun.serve({
    port: env.PORT,
    hostname: "0.0.0.0",
    fetch: (req, server) => {
        if (server.upgrade(req)) {
            return;
        } else {
            const url = new URL(req.url).pathname;
            // const ip = decoder.decode(res.getRemoteAddressAsText());
            // logger.debug(`${req.getMethod()} ${url} ${ip}`);
            // res.writeStatus(`200 OK`).end("HI!");
            const file = path.join("./public/", url);

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
            const socket = new Socket(ws, createSocketID());
            (ws as unknown as any).socket = socket;
            // logger.debug("Connection at " + socket.getIP());

            socketsBySocketID.set(socket.socketID, socket);
        },

        message: (ws, message) => {
            const msg = message.toString();
            handleMessage((ws as unknown as any).socket, msg);
        },

        close: (ws, code, message) => {
            // logger.debug("Close called");
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
