import readline from "readline";
import { Logger } from "./Logger";

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const logger = new Logger("CLI");

rl.setPrompt("mpps> ");
rl.prompt();

rl.on("line", msg => {
    // TODO readline commands

    if (msg == "mem" || msg == "memory") {
        const mem = process.memoryUsage();
        logger.info(
            `Memory: ${(mem.heapUsed / 1000 / 1000).toFixed(2)} MB used / ${(
                mem.heapTotal /
                1000 /
                1000
            ).toFixed(2)} MB total`
        );
    }

    rl.prompt();
});

rl.on("SIGINT", () => {
    process.exit();
});

(globalThis as unknown as any).rl = rl;
