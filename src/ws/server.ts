import { App, DEDICATED_COMPRESSOR_8KB } from "uWebSockets.js";
import { Logger } from "../util/Logger";
import { createUserID } from "../util/id";

const logger = new Logger("WebSocket Server");

export const app = App()
    .get("/", (res, req) => {
        const url = req.getUrl();
        logger.debug(`${req.getMethod()} ${url} ${req}`);
        res.writeStatus(`200 OK`).end("HI!");
    })
    .ws("/*", {
        idleTimeout: 30,
        maxBackpressure: 1024,
        maxPayloadLength: 8192,
        compression: DEDICATED_COMPRESSOR_8KB,

        open: ws => {
            const ip = String(ws.getRemoteAddressAsText());
            const _id = createUserID(ip);

            logger.debug(ip, _id);
        },

        message: (ws, message, isBinary) => {
            const msg = String(message);
            logger.debug(msg);
        }
    });
