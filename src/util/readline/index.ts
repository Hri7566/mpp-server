import readline from "readline";
import logger from "./logger";
import Command from "./Command";
import "./commands";

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.setPrompt("mpps> ");
rl.prompt();

rl.on("line", async line => {
    const out = await Command.handleCommand(line);
    logger.info(out);
    rl.prompt();
});

rl.on("SIGINT", () => {
    process.exit();
});

(globalThis as unknown as any).rl = rl;
