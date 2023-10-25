import EventEmitter from "events";
import { Logger } from "../util/Logger";
import { loadConfig } from "../util/config";
import {
    ChannelSettingValue,
    ChannelSettings,
    ClientEvents,
    Participant,
    ServerEvents
} from "../util/types";
import { Socket } from "../ws/Socket";
import { validateChannelSettings } from "./settings";
import { socketsBySocketID } from "../ws/server";
import Crown from "./Crown";

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
    // TODO Test this regex
    lobbyRegexes: ["^lobby[1-9]?[1-9]?$", "^test/.+$"],
    lobbyBackdoor: "lolwutsecretlobbybackdoor",
    fullChannel: "test/awkward"
});

export const channelList = new Array<Channel>();

export class Channel extends EventEmitter {
    private settings: Partial<ChannelSettings> = config.defaultSettings;
    private ppl = new Array<Participant>();

    public logger: Logger;
    public chatHistory = new Array<ClientEvents["a"]>();

    // TODO Add the crown
    public crown?: Crown;

    constructor(
        private _id: string,
        set?: Partial<ChannelSettings>,
        creator?: Socket,
        owner_id?: string
    ) {
        super();

        this.logger = new Logger("Channel - " + _id);

        // Validate settings in set
        // Set the verified settings

        if (!this.isLobby()) {
            if (set) {
                const validatedSet = validateChannelSettings(set);

                for (const key in Object.keys(validatedSet)) {
                    if (!(validatedSet as any)[key]) continue;

                    (this.settings as any)[key] = (set as any)[key];
                }
            }

            this.crown = new Crown();

            if (creator) {
                if (this.crown.canBeSetBy(creator)) {
                    const part = creator.getParticipant();
                    if (part) this.giveCrown(part);
                }
            }
        }

        if (this.isLobby()) {
            this.settings = config.lobbySettings;
        }

        this.bindEventListeners();

        channelList.push(this);
        // TODO channel closing
    }

    private alreadyBound = false;

    private bindEventListeners() {
        if (this.alreadyBound) return;
        this.alreadyBound = true;

        this.on("update", () => {
            // Send updated info
            for (const socket of socketsBySocketID.values()) {
                for (const p of this.ppl) {
                    if (socket.getParticipantID() == p.id) {
                        socket.sendChannelUpdate(
                            this.getInfo(),
                            this.getParticipantList()
                        );
                    }
                }
            }

            if (this.ppl.length == 0) {
                this.destroy();
            }
        });

        this.on("message", (msg: ServerEvents["a"], socket: Socket) => {
            if (!msg.message) return;

            const userFlags = socket.getUserFlags();

            this.logger.debug(userFlags);

            if (userFlags) {
                if (userFlags.cant_chat) return;
            }

            // Sanitize
            msg.message = msg.message
                .replace(/\p{C}+/gu, "")
                .replace(/(\p{Mc}{5})\p{Mc}+/gu, "$1")
                .trim();

            let outgoing: ClientEvents["a"] = {
                m: "a",
                a: msg.message,
                t: Date.now(),
                p: socket.getParticipant() as Participant
            };

            this.sendArray([outgoing]);
            this.chatHistory.push(outgoing);

            try {
                if (msg.message.startsWith("/")) {
                    this.emit("command", msg, socket);
                }
            } catch (err) {
                this.logger.debug(err);
            }
        });
    }

    /**
     * Get this channel's ID (channel name)
     * @returns Channel ID
     */
    public getID() {
        return this._id;
    }

    /**
     * Determine whether this channel is a lobby (uses regex from config)
     * @returns Boolean
     */
    public isLobby() {
        for (const reg of config.lobbyRegexes) {
            let exp = new RegExp(reg, "g");

            if (this.getID().match(exp)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Change this channel's settings
     * @param set Channel settings
     * @param admin Whether a user is changing the settings (set to true to force the changes)
     * @returns undefined
     */
    public changeSettings(
        set: Partial<ChannelSettings>,
        admin: boolean = false
    ) {
        if (this.isDestroyed()) return;
        if (!admin) {
            if (set.lobby) set.lobby = undefined;
            if (set.owner_id) set.owner_id = undefined;
        }

        if (this.isLobby() && !admin) return;

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

    /**
     * Get a channel setting's value
     * @param setting Channel setting to get
     * @returns Value of setting
     */
    public getSetting(setting: keyof ChannelSettings) {
        return this.settings[setting];
    }

    /**
     * Make a socket join this channel
     * @param socket Socket that is joining
     * @returns undefined
     */
    public join(socket: Socket) {
        if (this.isDestroyed()) return;
        const part = socket.getParticipant() as Participant;

        // Unknown side-effects, but for type safety...
        // if (!part) return;

        let hasChangedChannel = false;
        let oldChannelID = socket.currentChannelID;

        // this.logger.debug("Has user?", this.hasUser(part._id));

        // Is user in this channel?
        if (this.hasUser(part._id)) {
            // Alreay in channel, don't add to list, but tell them they're here
            hasChangedChannel = true;
            this.ppl.push(part);
        } else {
            // Are we full?
            if (!this.isFull()) {
                // Add to channel
                hasChangedChannel = true;
                this.ppl.push(part);
            } else {
                // Put us in full channel
                return socket.setChannel(config.fullChannel);
            }
        }

        if (hasChangedChannel) {
            if (socket.currentChannelID) {
                const ch = channelList.find(
                    ch => ch._id == socket.currentChannelID
                );
                if (ch) {
                    ch?.leave(socket);
                }
            }

            socket.currentChannelID = this.getID();
        }

        // Send our data back
        socket.sendArray([
            {
                m: "ch",
                ch: this.getInfo(),
                p: part.id,
                ppl: this.getParticipantList()
            },
            {
                m: "c",
                c: this.chatHistory.slice(-50)
            }
        ]);

        const cursorPos: {
            x: string | number | undefined;
            y: string | number | undefined;
        } = socket.getCursorPos();

        // Broadcast participant update
        this.sendArray([
            {
                m: "p",
                _id: part._id,
                name: part.name,
                color: part.color,
                id: part.id,
                x: cursorPos.x,
                y: cursorPos.y
            }
        ]);
    }

    /**
     * Make a socket leave this channel
     * @param socket Socket that is leaving
     */
    public leave(socket: Socket) {
        // this.logger.debug("Leave called");
        const part = socket.getParticipant() as Participant;

        let dupeCount = 0;
        for (const s of socketsBySocketID.values()) {
            if (s.getParticipantID() == part.id) {
                if (s.currentChannelID == this.getID()) {
                    dupeCount++;
                }
            }
        }

        // this.logger.debug("Dupes:", dupeCount);

        if (dupeCount == 1) {
            const p = this.ppl.find(p => p.id == socket.getParticipantID());

            if (p) {
                this.ppl.splice(this.ppl.indexOf(p), 1);
            }
        }

        // Broadcast bye
        this.sendArray([
            {
                m: "bye",
                p: part.id
            }
        ]);

        this.emit("update");
    }

    /**
     * Determine whether this channel has too many users
     * @returns Boolean
     */
    public isFull() {
        // TODO Use limit setting

        // if (this.isLobby() && this.ppl.length >= 20) {
        //     return true;
        // }

        return false;
    }

    /**
     * Get this channel's information
     * @returns Channel info object (includes ID, number of users, settings, and the crown)
     */
    public getInfo() {
        return {
            _id: this.getID(),
            id: this.getID(),
            count: this.ppl.length,
            settings: this.settings,
            crown: JSON.parse(JSON.stringify(this.crown))
        };
    }

    /**
     * Get the people in this channel
     * @returns List of people
     */
    public getParticipantList() {
        return this.ppl;
    }

    /**
     * Determine whether a user is in this channel (by user ID)
     * @param _id User ID
     * @returns Boolean
     */
    public hasUser(_id: string) {
        const foundPart = this.ppl.find(p => p._id == _id);
        return !!foundPart;
    }

    /**
     * Determine whether a user is in this channel (by participant ID)
     * @param id Participant ID
     * @returns Boolean
     */
    public hasParticipant(id: string) {
        const foundPart = this.ppl.find(p => p.id == id);
        return !!foundPart;
    }

    /**
     * Send messages to everyone in this channel
     * @param arr List of events to send to clients
     */
    public sendArray<EventID extends keyof ClientEvents>(
        arr: ClientEvents[EventID][]
    ) {
        let sentSocketIDs = new Array<string>();

        for (const p of this.ppl) {
            socketLoop: for (const socket of socketsBySocketID.values()) {
                if (socket.isDestroyed()) continue socketLoop;
                if (socket.getParticipantID() != p.id) continue socketLoop;
                if (sentSocketIDs.includes(socket.socketID))
                    continue socketLoop;
                socket.sendArray(arr);
                sentSocketIDs.push(socket.socketID);
            }
        }
    }

    /**
     * Play notes (usually from a socket)
     * @param msg Note message
     * @param socket Socket that is sending notes
     * @returns undefined
     */
    public playNotes(msg: ServerEvents["n"], socket: Socket) {
        if (this.isDestroyed()) return;
        const part = socket.getParticipant();
        if (!part) return;

        let clientMsg: ClientEvents["n"] = {
            m: "n",
            n: msg.n,
            t: msg.t,
            p: part.id
        };

        let sentSocketIDs = new Array<string>();

        for (const p of this.ppl) {
            socketLoop: for (const socket of socketsBySocketID.values()) {
                if (socket.isDestroyed()) continue socketLoop;
                if (socket.getParticipantID() != p.id) continue socketLoop;
                if (socket.getParticipantID() == part.id) continue socketLoop;
                if (sentSocketIDs.includes(socket.socketID))
                    continue socketLoop;
                socket.sendArray([clientMsg]);
                sentSocketIDs.push(socket.socketID);
            }
        }
    }

    private destroyed = false;

    /**
     * Set this channel to the destroyed state
     * @returns undefined
     */
    public destroy() {
        if (this.destroyed) return;
        this.destroyed = true;

        if (this.ppl.length > 0) {
            for (const socket of socketsBySocketID.values()) {
                if (socket.currentChannelID !== this.getID()) continue;
                socket.setChannel(config.fullChannel);
            }
        }

        channelList.splice(channelList.indexOf(this), 1);
    }

    /**
     * Determine whether the channel is in a destroyed state
     * @returns Boolean
     */
    public isDestroyed() {
        return this.destroyed == true;
    }

    /**
     * Change ownership (don't forget to use crown.canBeSetBy if you're letting a user call this)
     * @param part Participant to give crown to (or undefined to drop crown)
     */
    public chown(part?: Participant) {
        if (this.crown) {
            if (part) {
                this.giveCrown(part);
            } else {
                this.dropCrown();
            }
        }
    }

    /**
     * Give the crown to a user (no matter what)
     * @param part Participant to give crown to
     * @param force Whether or not to force-create a crown (useful for lobbies)
     */
    public giveCrown(part: Participant, force?: boolean) {
        if (force) {
            if (!this.crown) this.crown = new Crown();
        }

        if (this.crown) {
            this.crown.userId = part._id;
            this.crown.participantId = part.id;
            this.crown.time = Date.now();
            this.emit("update");
        }
    }

    /**
     * Drop the crown (remove from user)
     */
    public dropCrown() {
        if (this.crown) {
            delete this.crown.participantId;
            this.crown.time = Date.now();
            this.emit("update");
        }
    }
}

export default Channel;

// Channel forceloader (cringe)
let hasFullChannel = false;

for (const id of config.forceLoad) {
    new Channel(id);
    if (id == config.fullChannel) hasFullChannel = true;
}

if (!hasFullChannel) {
    channelList.push(new Channel(config.fullChannel));
}
