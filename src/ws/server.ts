import {
    App,
    DEDICATED_COMPRESSOR_8KB,
    HttpRequest,
    HttpResponse,
    WebSocket
} from "uWebSockets.js";
import { Logger } from "../util/Logger";
import { createUserID } from "../util/id";
import { readFileSync, lstatSync } from "fs";
import { join } from "path/posix";
import { handleMessage } from "./message";
import { decoder } from "../util/helpers";
import { Socket } from "./Socket";

const logger = new Logger("WebSocket Server");

export const app = App()
    .get("/*", async (res, req) => {
        const url = req.getUrl();
        const ip = decoder.decode(res.getRemoteAddressAsText());
        // logger.debug(`${req.getMethod()} ${url} ${ip}`);
        // res.writeStatus(`200 OK`).end("HI!");
        const file = join("./public/", url);

        // TODO Cleaner file serving
        try {
            const stats = lstatSync(file);

            let data;
            if (!stats.isDirectory()) {
                data = readFileSync(file);
            }

            // logger.debug(filename);

            if (!data) {
                const index = readFileSync("./public/index.html");

                if (!index) {
                    return void res
                        .writeStatus(`404 Not Found`)
                        .end("uh oh :(");
                } else {
                    return void res.writeStatus(`200 OK`).end(index);
                }
            }

            res.writeStatus(`200 OK`).end(data);
        } catch (err) {
            logger.warn("Unable to serve file at", file);
            logger.error(err);
            const index = readFileSync("./public/index.html");

            if (!index) {
                return void res.writeStatus(`404 Not Found`).end("uh oh :(");
            } else {
                return void res.writeStatus(`200 OK`).end(index);
            }
        }
    })
    .ws("/*", {
        idleTimeout: 180,
        maxBackpressure: 1024,
        maxPayloadLength: 8192,
        compression: DEDICATED_COMPRESSOR_8KB,

        open: ((ws: WebSocket<unknown> & { socket: Socket }) => {
            ws.socket = new Socket(ws);
            // logger.debug("Connection at " + ws.socket.getIP());
        }) as (ws: WebSocket<unknown>) => void,

        message: ((
            ws: WebSocket<unknown> & { socket: Socket },
            message,
            isBinary
        ) => {
            const msg = decoder.decode(message);
            handleMessage(ws.socket, msg);
        }) as (
            ws: WebSocket<unknown>,
            message: ArrayBuffer,
            isBinary: boolean
        ) => void,

        close: ((
            ws: WebSocket<unknown> & { socket: Socket },
            code: number,
            message: ArrayBuffer
        ) => {
            // TODO handle close event
        }) as (
            ws: WebSocket<unknown>,
            code: number,
            message: ArrayBuffer
        ) => void
    });
