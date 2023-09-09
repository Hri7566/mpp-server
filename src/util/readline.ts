import readline from "readline";

export const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.setPrompt("mpps> ");

rl.prompt();

rl.on("line", msg => {
    // TODO readline commands
    rl.prompt();
});

rl.on("SIGINT", () => {
    process.exit();
});
