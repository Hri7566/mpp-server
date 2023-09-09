// import {
//     App,
//     DEDICATED_COMPRESSOR_8KB,
//     HttpRequest,
//     HttpResponse,
//     WebSocket
// } from "uWebSockets.js";
import { Logger } from "../util/Logger";
import { createUserID } from "../util/id";
import fs from "fs";
// import { join } from "path";
import path from "path";
import { handleMessage } from "./message";
import { decoder } from "../util/helpers";
import { Socket } from "./Socket";
import { serve, file } from "bun";
import env from "../util/env";

const logger = new Logger("WebSocket Server");

const usersByPartID = new Map<string, Socket>();

export function findSocketByPartID(id: string) {
    for (const key of usersByPartID.keys()) {
        if (key == id) return usersByPartID.get(key);
    }
}

// Original uWebSockets code
// export const app = App()
//     .get("/*", async (res, req) => {
//         const url = req.getUrl();
//         const ip = decoder.decode(res.getRemoteAddressAsText());
//         // logger.debug(`${req.getMethod()} ${url} ${ip}`);
//         // res.writeStatus(`200 OK`).end("HI!");
//         const file = join("./public/", url);

//         // TODO Cleaner file serving
//         try {
//             const stats = lstatSync(file);

//             let data;
//             if (!stats.isDirectory()) {
//                 data = readFileSync(file);
//             }

//             // logger.debug(filename);

//             if (!data) {
//                 const index = readFileSync("./public/index.html");

//                 if (!index) {
//                     return void res
//                         .writeStatus(`404 Not Found`)
//                         .end("uh oh :(");
//                 } else {
//                     return void res.writeStatus(`200 OK`).end(index);
//                 }
//             }

//             res.writeStatus(`200 OK`).end(data);
//         } catch (err) {
//             logger.warn("Unable to serve file at", file);
//             logger.error(err);
//             const index = readFileSync("./public/index.html");

//             if (!index) {
//                 return void res.writeStatus(`404 Not Found`).end("uh oh :(");
//             } else {
//                 return void res.writeStatus(`200 OK`).end(index);
//             }
//         }
//     })
//     .ws("/*", {
//         idleTimeout: 25,
//         maxBackpressure: 1024,
//         maxPayloadLength: 8192,
//         compression: DEDICATED_COMPRESSOR_8KB,

//         open: ((ws: WebSocket<unknown> & { socket: Socket }) => {
//             ws.socket = new Socket(ws);
//             // logger.debug("Connection at " + ws.socket.getIP());

//             usersByPartID.set(ws.socket.getParticipantID(), ws.socket);
//         }) as (ws: WebSocket<unknown>) => void,

//         message: ((
//             ws: WebSocket<unknown> & { socket: Socket },
//             message,
//             isBinary
//         ) => {
//             const msg = decoder.decode(message);
//             handleMessage(ws.socket, msg);
//         }) as (
//             ws: WebSocket<unknown>,
//             message: ArrayBuffer,
//             isBinary: boolean
//         ) => void,

//         close: ((
//             ws: WebSocket<unknown> & { socket: Socket },
//             code: number,
//             message: ArrayBuffer
//         ) => {
//             logger.debug("Close called");
//             ws.socket.destroy();
//             usersByPartID.delete(ws.socket.getParticipantID());
//         }) as (
//             ws: WebSocket<unknown>,
//             code: number,
//             message: ArrayBuffer
//         ) => void
//     });

export const app = Bun.serve({
    port: env.PORT,
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
            const socket = new Socket(ws);
            (ws as unknown as any).socket = socket;
            logger.debug("Connection at " + socket.getIP());

            usersByPartID.set(socket.getParticipantID(), socket);
        },

        message: (ws, message) => {
            const msg = message.toString();
            handleMessage((ws as unknown as any).socket, msg);
        },

        close: (ws, code, message) => {
            logger.debug("Close called");
            const socket = (ws as unknown as any).socket as Socket;
            socket.destroy();
            usersByPartID.delete(socket.getParticipantID());
        }
    }
});
