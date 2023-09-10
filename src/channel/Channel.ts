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

export class Channel extends EventEmitter {
    private settings: Partial<ChannelSettings> = config.defaultSettings;
    private ppl = new Array<Participant>();

    public logger: Logger;
    public chatHistory = new Array<ClientEvents["a"]>();

    // TODO Add the crown

    constructor(private _id: string, set?: Partial<ChannelSettings>) {
        super();

        this.logger = new Logger("Channel - " + _id);

        // Validate settings in set
        // Set the verified settings

        if (set && !this.isLobby()) {
            const validatedSet = validateChannelSettings(set);

            for (const key in Object.keys(validatedSet)) {
                if (!(validatedSet as any)[key]) continue;

                (this.settings as any)[key] = (set as any)[key];
            }
        }

        if (this.isLobby()) {
            this.settings = config.lobbySettings;
        }

        this.bindEventListeners();
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

    public join(socket: Socket) {
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

        const cursorPos = socket.getCursorPos();

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

    public isFull() {
        // TODO Use limit setting

        // if (this.isLobby() && this.ppl.length >= 20) {
        //     return true;
        // }

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

    public hasUser(_id: string) {
        const foundPart = this.ppl.find(p => p._id == _id);
        return !!foundPart;
    }

    public hasParticipant(id: string) {
        const foundPart = this.ppl.find(p => p.id == id);
        return !!foundPart;
    }

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

    private alreadyBound = false;

    private bindEventListeners() {
        if (this.alreadyBound) return;
        this.alreadyBound = true;

        this.on("update", () => {
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
        });

        this.on("a", (msg: ServerEvents["a"], socket: Socket) => {
            if (!msg.message) return;

            let outgoing: ClientEvents["a"] = {
                m: "a",
                a: msg.message,
                t: Date.now(),
                p: socket.getParticipant() as Participant
            };

            this.sendArray([outgoing]);
            this.chatHistory.push(outgoing);
        });
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
