import { App, DEDICATED_COMPRESSOR_8KB } from "uWebSockets.js";
import { Logger } from "../util/Logger";

const logger = new Logger("WebSocket Server");

export const app = App()
    .get("/", (res, req) => {})
    .ws("/*", {
        idleTimeout: 30,
        maxBackpressure: 1024,
        maxPayloadLength: 8192,
        compression: DEDICATED_COMPRESSOR_8KB,

        message: (ws, message, isBinary) => {
            const msg = String(message);
            logger.debug(msg);
        }
    });
