import { Channel } from "./Channel";
import { config } from "./config";
import { Logger } from "../util/Logger";
import { ChannelList } from "./ChannelList";

// Channel forceloader (cringe)

const logger = new Logger("Channel Forceloader");

export function forceloadChannel(id: string) {
    try {
        logger.info("Forceloading", id);
        new Channel(id, undefined, undefined, undefined, true);
        return true;
    } catch (err) {
        return false;
    }
}

export function unforceloadChannel(id: string) {
    const ch = ChannelList.getList().find(ch => ch.getID() == id);
    if (!ch) return false;

    logger.info("Unloading", id);
    ch.destroy();

    return true;
}

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
