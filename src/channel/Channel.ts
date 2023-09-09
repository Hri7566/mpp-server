import { Logger } from "../util/Logger";
import { loadConfig } from "../util/config";
import {
    ChannelSettingValue,
    ChannelSettings,
    Participant
} from "../util/types";
import { Socket } from "../ws/Socket";
import { app, findSocketByPartID } from "../ws/server";
import { validateChannelSettings } from "./settings";

interface ChannelConfig {
    forceLoad: string[];
    lobbySettings: Partial<ChannelSettings>;
    defaultSettings: Partial<ChannelSettings>;
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
        visible: true
    },
    defaultSettings: {
        chat: true,
        crownsolo: false,
        color: "#480505",
        color2: "#000000",
        visible: true
    },
    // TODO Test this regex
    lobbyRegexes: ["^lobby[1-9]?[1-9]?$", "^test/.+$"],
    lobbyBackdoor: "lolwutsecretlobbybackdoor",
    fullChannel: "test/awkward"
});

export const channelList = new Array<Channel>();

export class Channel {
    private settings: Partial<ChannelSettings> = config.defaultSettings;
    private ppl = new Array<Participant>();

    public logger: Logger;

    // TODO Add the crown

    constructor(
        private _id: string,
        set: Partial<ChannelSettings> = config.defaultSettings
    ) {
        this.logger = new Logger("Channel - " + _id);
        // Verify default settings just in case
        this.changeSettings(this.settings, true);

        if (this.isLobby()) {
            set = config.lobbySettings;
        }

        this.changeSettings(set);
    }

    public getID() {
        return this._id;
    }

    public isLobby() {
        for (const reg of config.lobbyRegexes) {
            let exp = new RegExp(reg, "g");

            if (this.getID().match(exp)) {
                return true;
            }
        }

        return false;
    }

    public changeSettings(
        set: Partial<ChannelSettings>,
        admin: boolean = false
    ) {
        if (!admin) {
            if (set.lobby) set.lobby = undefined;
            if (set.owner_id) set.owner_id = undefined;
        }

        // Verify settings
        const validSettings = validateChannelSettings(set);

        for (const key of Object.keys(validSettings)) {
            // Setting is valid?
            if ((validSettings as Record<string, boolean>)[key]) {
                // Change setting
                (this.settings as Record<string, ChannelSettingValue>)[key] = (
                    set as Record<string, ChannelSettingValue>
                )[key];
            }
        }
    }

    public join(socket: Socket) {
        const part = socket.getParticipant();

        // Unknown side-effects, but for type safety...
        if (!part) return;

        let hasChangedChannel = false;

        this.logger.debug("Has user?", this.hasUser(part));

        // Is user in this channel?
        if (this.hasUser(part)) {
            // Alreay in channel, disconnect old

            const oldSocket = findSocketByPartID(part.id);

            if (oldSocket) {
                oldSocket.destroy();
            }

            // Add to channel
            this.ppl.push(part);
            hasChangedChannel = true;
        } else {
            // Are we full?
            if (!this.isFull()) {
                // Add to channel
                this.ppl.push(part);
                hasChangedChannel = true;
            } else {
                // Put us in full channel
                socket.setChannel(config.fullChannel);
            }
        }

        if (hasChangedChannel) {
            // Is user in any channel that isn't this one?
            for (const ch of channelList) {
                if (ch == this) continue;
                if (ch.hasUser(part)) {
                    ch.leave(socket);
                }
            }
        }

        this.logger.debug("Participant list:", this.ppl);

        // Send our data back
        socket.sendArray([
            {
                m: "ch",
                ch: this.getInfo(),
                p: part.id,
                ppl: this.getParticipantList()
            }
        ]);

        // TODO Broadcast channel update
    }

    public leave(socket: Socket) {
        this.logger.debug("Leave called");
        const part = socket.getParticipant();

        // Same as above...
        if (!part) return;

        if (this.hasUser(part)) {
            this.ppl.splice(this.ppl.indexOf(part), 1);
        }
        // TODO Broadcast channel update
    }

    public isFull() {
        // TODO Use limit setting

        if (this.isLobby() && this.ppl.length >= 20) {
            return true;
        }

        return false;
    }

    public getInfo() {
        return {
            _id: this.getID(),
            id: this.getID(),
            count: this.ppl.length,
            settings: this.settings
        };
    }

    public getParticipantList() {
        return this.ppl;
    }

    public hasUser(part: Participant) {
        const foundPart = this.ppl.find(p => p._id == part._id);
        return !!foundPart;
    }
}

// Forceloader
let hasFullChannel = false;

for (const id of config.forceLoad) {
    channelList.push(new Channel(id));
    if (id == config.fullChannel) hasFullChannel = true;
}

if (!hasFullChannel) {
    channelList.push(new Channel(config.fullChannel));
}
