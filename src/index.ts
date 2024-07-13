/**
 * MPP Server 2
 * for mpp.dev
 * by Hri7566
 */

// If you don't load the server first, bun will literally segfault
import "./ws/server";
import { loadForcedStartupChannels } from "./channel/forceLoad";
import { Logger } from "./util/Logger";

const logger = new Logger("Main");
logger.info("Forceloading startup channels...");
loadForcedStartupChannels();

import "./util/readline";

logger.info("Ready");
