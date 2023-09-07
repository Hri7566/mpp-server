import env from "~/util/env";
import { app } from "~/ws/server";
import { Logger } from "~/util/Logger";

const logger = new Logger("Main");

app.listen("0.0.0.0", env.PORT, () => {
    logger.info("Listening on :" + env.PORT);
});
