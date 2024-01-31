import { loadConfig } from "../util/config";
import { IChannelSettings } from "../util/types";

interface ChannelConfig {
    forceLoad: string[];
    lobbySettings: Partial<IChannelSettings>;
    defaultSettings: Partial<IChannelSettings>;
    lobbyRegexes: string[];
    lobbyBackdoor: string;
    fullChannel: string;
}

export const config = loadConfig<ChannelConfig>("config/channels.yml", {
    forceLoad: ["lobby", "test/awkward"],
    lobbySettings: {
        lobby: true,
        chat: true,
        crownsolo: false,
        visible: true,
        color: "#73b3cc",
        color2: "#273546"
    },
    defaultSettings: {
        chat: true,
        crownsolo: false,
        color: "#3b5054",
        color2: "#001014",
        visible: true
    },
    // Here's a terrifying fact: Brandon used parseInt to check lobby names in the OG server code
    lobbyRegexes: ["^lobby[0-9][0-9]$", "^lobby[1-9]$", "^test/.+$"],
    lobbyBackdoor: "lolwutsecretlobbybackdoor",
    fullChannel: "test/awkward"
});
