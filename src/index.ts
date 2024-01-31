/**
 * MPP Server 2
 * for mpp.dev
 * by Hri7566
 */

// If you don't load the server first, bun will literally segfault
import "./ws/server";
import "./channel/forceLoad";
import { Logger } from "./util/Logger";

const logger = new Logger("Main");

import "./util/readline";

// Does this really even need to be here?
logger.info("Ready");
