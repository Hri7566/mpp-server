import EventEmitter from "events";
import { Logger } from "../util/Logger";
import {
    ChannelSettingValue,
    IChannelSettings,
    ClientEvents,
    Participant,
    ServerEvents,
    IChannelInfo
} from "../util/types";
import type { Socket } from "../ws/Socket";
import { validateChannelSettings } from "./settings";
import { findSocketByPartID, socketsBySocketID } from "../ws/Socket";
import Crown from "./Crown";
import { ChannelList } from "./ChannelList";
import { config } from "./config";
import { saveChatHistory, getChatHistory } from "../data/history";

interface CachedKickban {
    userId: string;
    startTime: number;
    endTime: number;
}

export class Channel extends EventEmitter {
    private settings: Partial<IChannelSettings> = config.defaultSettings;
    private ppl = new Array<Participant>();
    public chatHistory = new Array<ClientEvents["a"]>();
    private async loadChatHistory() {
        this.chatHistory = await getChatHistory(this.getID());
    }

    public logger: Logger;
    public bans = new Array<CachedKickban>();

    public crown?: Crown;

    constructor(
        private _id: string,
        set?: Partial<IChannelSettings>,
        creator?: Socket,
        owner_id?: string,
        public stays: boolean = false
    ) {
        super();

        this.logger = new Logger("Channel - " + _id);

        // Validate settings in set
        // Set the verified settings

        if (!this.isLobby()) {
            if (set) {
                const validatedSet = validateChannelSettings(set);

                for (const key of Object.keys(set)) {
                    if ((validatedSet as any)[key] === false) continue;
                    (this.settings as any)[key] = (set as any)[key];
                }
            }

            this.crown = new Crown();

            if (creator) {
                // if (this.crown.canBeSetBy(creator)) {
                const part = creator.getParticipant();
                if (part) this.giveCrown(part);
                // }
            }
        }

        if (this.isLobby()) {
            this.settings = config.lobbySettings;
        }

        this.bindEventListeners();

        ChannelList.add(this);
        // TODO implement owner_id

        this.logger.info("Created");
    }

    private alreadyBound = false;

    private bindEventListeners() {
        if (this.alreadyBound) return;
        this.alreadyBound = true;
        this.loadChatHistory();
        this.logger.info("Loaded Chat History.");

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

            if (this.ppl.length == 0 && !this.stays) {
                this.destroy();
            }
        });

        this.on("message", async (msg: ServerEvents["a"], socket: Socket) => {
            if (!msg.message) return;

            const userFlags = socket.getUserFlags();

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
            await saveChatHistory(this.getID(), this.chatHistory);

            try {
                if (msg.message.startsWith("/")) {
                    this.emit("command", msg, socket);
                }
            } catch (err) {
                this.logger.error(err);
            }
        });

        this.on("command", (msg, socket) => {
            // TODO commands
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
        set: Partial<IChannelSettings>,
        admin: boolean = false
    ) {
        if (this.isDestroyed()) return;
        if (!admin) {
            if (set.lobby) set.lobby = undefined;
            if (set.owner_id) set.owner_id = undefined;
        }

        this.logger.debug(
            "Dreaded color2 conditions:",
            typeof set.color == "string",
            "and",
            typeof set.color2 == "undefined"
        );

        if (
            typeof set.color == "string" &&
            (typeof set.color2 == "undefined" ||
                set.color2 === this.settings.color2)
        ) {
            const r = Math.max(
                0,
                parseInt(set.color.substring(1, 3), 16) - 0x40
            );
            const g = Math.max(
                0,
                parseInt(set.color.substring(3, 5), 16) - 0x40
            );
            const b = Math.max(
                0,
                parseInt(set.color.substring(5, 7), 16) - 0x40
            );

            set.color2 = `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
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

        this.emit("update", this);
    }

    /**
     * Get a channel setting's value
     * @param setting Channel setting to get
     * @returns Value of setting
     */
    public getSetting(setting: keyof IChannelSettings) {
        return this.settings[setting];
    }

    /**
     * Make a socket join this channel
     * @param socket Socket that is joining
     * @returns undefined
     */
    public join(socket: Socket): void {
        //! /!\ Players are forced to join the same channel on two different tabs!
        //? TODO Should this be a bug or a feature?

        if (this.isDestroyed()) return;
        const part = socket.getParticipant() as Participant;

        let hasChangedChannel = false;
        let oldChannelID = socket.currentChannelID;

        // Is user banned?
        if (this.isBanned(part._id)) {
            // Send user to ban channel instead
            // TODO Send notification for ban
            const chs = ChannelList.getList();
            for (const ch of chs) {
                if (ch.getID() == config.fullChannel) {
                    return ch.join(socket);
                }
            }
        }

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
                // Put them in full channel
                return socket.setChannel(config.fullChannel);
            }
        }

        // Was the move complete?
        if (hasChangedChannel) {
            // Were they in a channel before?
            if (socket.currentChannelID) {
                // Find the channel they were in
                const ch = ChannelList.getList().find(
                    ch => ch._id == socket.currentChannelID
                );

                // Tell the channel they left
                if (ch) ch.leave(socket);
            }

            // Change the thing we checked to point to us now
            socket.currentChannelID = this.getID();
        }

        // Send our state data back
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

        // Get our friend's cursor position
        const cursorPos: {
            x: string | number | undefined;
            y: string | number | undefined;
        } = socket.getCursorPos();

        // Broadcast a participant update for them
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

        // Broadcast a channel update so everyone subscribed to the channel list can see us
        this.emit("update", this);
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

            // Broadcast bye
            this.sendArray([
                {
                    m: "bye",
                    p: part.id
                }
            ]);

            this.emit("update", this);
        }
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
    public getInfo(_id?: string) {
        return {
            _id: this.getID(),
            id: this.getID(),
            banned: _id ? this.isBanned(_id) : false,
            count: this.ppl.length,
            settings: this.settings,
            crown: this.crown
                ? JSON.parse(JSON.stringify(this.crown))
                : undefined
        } as IChannelInfo;
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

        ChannelList.remove(this);
        this.logger.info("Destroyed");
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
            this.emit("update", this);
        }
    }

    /**
     * Drop the crown (remove from user)
     */
    public dropCrown() {
        if (this.crown) {
            this.crown.time = Date.now();

            let socket;
            if (this.crown.participantId)
                socket = findSocketByPartID(this.crown.participantId);

            let x = Math.random() * 100;
            let y1 = Math.random() * 100;
            let y2 = y1 + Math.random() * (100 - y1);

            if (socket) {
                const cursorPos = socket.getCursorPos();

                let cursorX = cursorPos.x;
                if (typeof cursorPos.x == "string")
                    cursorX = parseInt(cursorPos.x);

                let cursorY = cursorPos.y;
                if (typeof cursorPos.y == "string")
                    cursorY = parseInt(cursorPos.y);
            }

            // Screen positions
            this.crown.startPos = { x, y: y1 };
            this.crown.endPos = { x, y: y2 };

            delete this.crown.participantId;

            this.emit("update", this);
        }
    }

    /**
     * Kickban a poor soul for t milliseconds.
     * @param _id User ID to ban
     * @param t Time in millseconds to ban for
     **/
    public kickban(_id: string, t: number = 1000 * 60 * 30) {
        const now = Date.now();

        if (!this.hasUser(_id)) return;

        const part = this.ppl.find(p => p._id == _id);
        if (!part) return;

        this.bans.push({
            userId: _id,
            startTime: now,
            endTime: now + t
        });

        const socket = findSocketByPartID(part.id);
        if (!socket) return;

        const banChannel = ChannelList.getList().find(
            ch => ch.getID() == config.fullChannel
        );

        if (!banChannel) return;
        banChannel.join(socket);

        this.emit("update", this);
    }

    public isBanned(_id: string) {
        const now = Date.now();

        for (const ban of this.bans) {
            if (ban.endTime <= now) {
                // Remove old ban and skip
                this.bans.splice(this.bans.indexOf(ban), 1);
                continue;
            }

            // Check if they are banned
            if (ban.userId == _id) {
                return true;
            }
        }

        return false;
    }
}

export default Channel;
