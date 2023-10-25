/**
 * MPP Server 2
 * for mpp.dev
 * by Hri7566
 */

// Preload environment variables
import env from "./util/env";

// import { app } from "./ws/server";
import "./ws/server";
import { Logger } from "./util/Logger";

const logger = new Logger("Main");
