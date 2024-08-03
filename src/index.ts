/**
 * MPP Server 2
 * for mpp.dev
 * by Hri7566
 */

// There are a lot of unhinged bs comments in this repo
// Pay no attention to the ones that cuss you out

// If you don't load the server first, bun will literally segfault
import "./ws/server";
import { loadForcedStartupChannels } from "./channel/forceLoad";
import { Logger } from "./util/Logger";

// Let's construct an entire object just for one thing to be printed
// and then keep it in memory for the entirety of runtime
const logger = new Logger("Main");
logger.info("Forceloading startup channels...");
loadForcedStartupChannels();

// This literally breaks editors and they stick all the imports here instead of at the top
import "./util/readline";
import { Socket, socketsBySocketID } from "./ws/Socket";
import { createSocketID } from "./util/id";

// Nevermind we use it twice
logger.info("Ready");

// Connect 5 sockets
const sockets = [];

for (let i = 0; i < 5; i++) {
    setTimeout(() => {
        const socket = new Socket(undefined, createSocketID());

        socket.on("ready", () => {
            logger.info(`Socket ${i} is ready`);
        });

        socket.setChannel("lobby");

        sockets.push(socket);

        if (socket.socketID == undefined) {
            socket.socketID = createSocketID();
        }

        socketsBySocketID.set(socket.socketID, socket);
    }, i * 5000);
}
