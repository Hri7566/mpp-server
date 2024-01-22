import { Logger } from "../util/Logger";
import { createSocketID, createUserID } from "../util/id";
import fs from "fs";
import path from "path";
import { handleMessage } from "./message";
import { decoder } from "../util/helpers";
import { Socket, socketsBySocketID } from "./Socket";
import { serve, file } from "bun";
import env from "../util/env";

const logger = new Logger("WebSocket Server");

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
                        return new Response(Bun.file("./public/index.html"));
                    }
                } else {
                    return new Response(Bun.file("./public/index.html"));
                }
            } catch (err) {
                return new Response(Bun.file("./public/index.html"));
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
            socket.destroy();

            for (const sockID of socketsBySocketID.keys()) {
                const sock = socketsBySocketID.get(sockID);

                if (sock == socket) {
                    socketsBySocketID.delete(sockID);
                }
            }
        }
    }
});

logger.info("Listening on port", env.PORT);
