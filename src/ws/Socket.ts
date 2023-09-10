import { createColor, createID, createUserID } from "../util/id";
import { decoder, encoder } from "../util/helpers";
import EventEmitter from "events";
import { ChannelSettings, ClientEvents, UserFlags } from "../util/types";
import { User } from "@prisma/client";
import { createUser, readUser } from "../data/user";
import { eventGroups } from "./events";
import { loadConfig } from "../util/config";
import { Gateway } from "./Gateway";
import { Channel, channelList } from "../channel/Channel";
import { ServerWebSocket } from "bun";
import { findSocketByUserID, socketsBySocketID } from "./server";
import { Logger } from "../util/Logger";

interface UsersConfig {
    defaultName: string;
    defaultFlags: UserFlags;
}

const usersConfig = loadConfig<UsersConfig>("config/users.yml", {
    defaultName: "Anonymous",
    defaultFlags: {
        volume: 100
    }
});

const logger = new Logger("Sockets");

export class Socket extends EventEmitter {
    private id: string;
    private _id: string;
    private ip: string;
    private user: User | null = null;

    public gateway = new Gateway();

    public desiredChannel: {
        _id: string | undefined;
        set: Partial<ChannelSettings> | undefined;
    } = {
        _id: undefined,
        set: {}
    };

    public currentChannelID: string | undefined;

    constructor(private ws: ServerWebSocket<unknown>) {
        super();
        this.ip = ws.remoteAddress; // Participant ID

        // User ID
        this._id = createUserID(this.getIP());

        // Check if we're already connected
        // We need to skip ourselves, so we loop here instead of using a helper
        let foundSocket;

        for (const socket of socketsBySocketID.values()) {
            if (socket == this) continue;

            if (socket.getUserID() == this.getUserID()) {
                foundSocket = socket;
            }
        }

        if (!foundSocket) {
            // Use new session ID
            this.id = createID();
        } else {
            // Use original session ID
            this.id = foundSocket.id;
        }

        this.loadUser();

        this.bindEventListeners();
    }

    public getIP() {
        return this.ip;
    }

    public getUserID() {
        return this._id;
    }

    public getParticipantID() {
        return this.id;
    }

    public setChannel(_id: string, set?: Partial<ChannelSettings>) {
        if (this.isDestroyed()) return;

        this.desiredChannel._id = _id;
        this.desiredChannel.set = set;

        let channel;
        try {
            for (const ch of channelList.values()) {
                if (ch.getID() == this.desiredChannel._id) {
                    channel = ch;
                    break;
                }
            }
        } catch (err) {}

        // Does channel exist?
        if (channel) {
            // Exists, join normally
            channel.join(this);
        } else {
            // Doesn't exist, join with crown
            channel = new Channel(
                this.desiredChannel._id,
                this.desiredChannel.set
            );

            channel.join(this);

            // TODO Give the crown upon joining
        }
    }

    private bindEventListeners() {
        for (const group of eventGroups) {
            // TODO Check event group permissions
            if (group.id == "admin") continue;

            for (const event of group.eventList) {
                this.on(event.id, event.callback);
            }
        }
    }

    public sendArray<EventID extends keyof ClientEvents>(
        arr: ClientEvents[EventID][]
    ) {
        if (this.isDestroyed()) return;
        this.ws.send(JSON.stringify(arr));
    }

    private async loadUser() {
        let user = await readUser(this._id);

        if (!user) {
            await createUser(
                this._id,
                usersConfig.defaultName,
                createColor(this.ip),
                usersConfig.defaultFlags
            );

            user = await readUser(this._id);
        }

        this.user = user;
    }

    public getUser() {
        if (this.user) {
            return this.user;
        }

        return null;
    }

    public getUserFlags() {
        if (this.user) {
            try {
                return JSON.parse(this.user.flags) as UserFlags;
            } catch (err) {
                return {} as UserFlags;
            }
        } else {
            return null;
        }
    }

    public getParticipant() {
        if (this.user) {
            const flags = this.getUserFlags();
            let facadeID = this._id;

            if (flags) {
                if (flags.override_id) {
                    facadeID = flags.override_id;
                }
            }

            return {
                _id: facadeID,
                name: this.user.name,
                color: this.user.color,
                id: this.id
            };
        } else {
            return null;
        }
    }

    private destroyed = false;

    public destroy() {
        // Socket was closed or should be closed, clear data

        // Simulate closure
        try {
            this.ws.close();
        } catch (err) {}

        if (this.currentChannelID) {
            const foundCh = channelList.find(
                ch => ch.getID() == this.currentChannelID
            );

            if (foundCh) foundCh.leave(this);
        }

        this.destroyed = true;
    }

    public isDestroyed() {
        return this.destroyed == true;
    }
}
