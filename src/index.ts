/**
 * MPP Server 2
 * for mpp.dev
 * by Hri7566
 */

// If you don't load the server first, bun will literally segfault
import "./ws/server";
import { loadDefaultForcedChannels } from "./channel/forceLoad";
import { Logger } from "./util/Logger";

const logger = new Logger("Main");
logger.info("Loading default channels...");
loadDefaultForcedChannels();

import "./util/readline";

// Does this really even need to be here?
logger.info("Ready");
