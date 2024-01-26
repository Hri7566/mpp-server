/**
 * MPP Server 2
 * for mpp.dev
 * by Hri7566
 */

import "./ws/server";
import "./channel/forceLoad";
import { Logger } from "./util/Logger";

const logger = new Logger("Main");

import "./util/readline";

logger.info("Ready");
