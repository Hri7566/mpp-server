import { Channel } from "./Channel";
import { config } from "./config";

// Channel forceloader (cringe)
let hasFullChannel = false;

for (const id of config.forceLoad) {
    new Channel(id, undefined, undefined, undefined, true);
    if (id == config.fullChannel) hasFullChannel = true;
}

if (!hasFullChannel) {
    new Channel(config.fullChannel, undefined, undefined, undefined, true);
}
