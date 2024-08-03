import { Channel } from "./Channel";
import { config } from "./config";
import { Logger } from "../util/Logger";
import { ChannelList } from "./ChannelList";

// Channel forceloader (cringe)

const logger = new Logger("Channel Forceloader");

/**
 * Forceloads a channel
 * @param id The channel ID
 * @returns Whether the channel was loaded
 */
export function forceloadChannel(id: string) {
    try {
        logger.info("Forceloading", id);
        new Channel(id, undefined, undefined, undefined, true);
        return true;
    } catch (err) {
        return false;
    }
}

/**
 * Unforceloads a channel
 * @param id The channel ID
 * @returns Whether the channel was unloaded
 */
export function unforceloadChannel(id: string) {
    const ch = ChannelList.getList().find(ch => ch.getID() == id);
    if (!ch) return false;

    logger.info("Unloading", id);
    ch.destroy();

    return true;
}

/**
 * Forceloads all forceload-configured channels
 * This is meant to be called on startup
 **/
export function loadForcedStartupChannels() {
    let hasFullChannel = false;

    for (const id of config.forceLoad) {
        forceloadChannel(id);
        if (id == config.fullChannel) hasFullChannel = true;
    }

    if (!hasFullChannel) {
        //new Channel(config.fullChannel, undefined, undefined, undefined, true);
        forceloadChannel(config.fullChannel);
    }
}
