/**
 * Socket connection module
 *
 * Represents user connections
 */

import { createColor, createID, createUserID } from "../util/id";
import EventEmitter from "events";
import {
    IChannelInfo,
    IChannelSettings,
    ClientEvents,
    Participant,
    ServerEvents,
    UserFlags,
    Vector2,
    Notification
} from "../util/types";
import type { User } from "@prisma/client";
import { createUser, readUser, updateUser } from "../data/user";
import { eventGroups } from "./events";
import { Gateway } from "./Gateway";
import { Channel } from "../channel/Channel";
import { ChannelList } from "../channel/ChannelList";
import { ServerWebSocket } from "bun";
import { Logger } from "../util/Logger";
import { RateLimitConstructorList, RateLimitList } from "./ratelimit/config";
import { adminLimits } from "./ratelimit/limits/admin";
import { userLimits } from "./ratelimit/limits/user";
import { NoteQuota } from "./ratelimit/NoteQuota";
import { config } from "./usersConfig";
import { config as channelConfig } from "../channel/config";
import { crownLimits } from "./ratelimit/limits/crown";

const logger = new Logger("Sockets");

type CursorValue = string | number;

export class Socket extends EventEmitter {
    private id: string;
    private _id: string;
    private ip: string;
    private uuid: string;
    private user: User | null = null;

    public gateway = new Gateway();

    public rateLimits: RateLimitList | undefined;
    public noteQuota = new NoteQuota();

    public desiredChannel: {
        _id: string | undefined;
        set: Partial<IChannelSettings> | undefined;
    } = {
            _id: undefined,
            set: {}
        };

    public currentChannelID: string | undefined;
    private cursorPos: Vector2<CursorValue> = { x: 200, y: 100 };

    constructor(
        private ws?: ServerWebSocket<{ ip: string }>,
        public socketID?: string
    ) {
        super();

        if (ws) {
            // Real user
            this.ip = ws.data.ip;
        } else {
            // Fake user
            this.ip = `::ffff:${Math.random() * 255}.${Math.random() * 255}.${Math.random() * 255}.${Math.random() * 255}`;
        }

        // User ID
        this._id = createUserID(this.getIP());
        this.uuid = crypto.randomUUID();

        // Check if we're already connected
        // We need to skip ourselves, so we loop here instead of using a helper
        let foundSocket;
        let count = 0;

        for (const socket of socketsBySocketID.values()) {
            if (socket.socketID == this.socketID) continue;

            if (socket.ws) {
                if (socket.ws.readyState !== 1) continue;
            }

            if (socket.getUserID() == this.getUserID()) {
                foundSocket = socket;
                count++;
            }
        }

        if (count >= 4) {
            this.destroy();
        }

        // logger.debug("Found socket?", foundSocket);

        if (!foundSocket) {
            // Use new session ID
            this.id = createID();
        } else {
            // Use original session ID
            this.id = foundSocket.id;

            // Break us off
            //this.id = "broken";
            //this.destroy();
        }

        (async () => {
            await this.loadUser();

            this.resetRateLimits();
            this.setNoteQuota(NoteQuota.PARAMS_RIDICULOUS);

            this.bindEventListeners();
        })();
    }

    /**
     * Get the IP of this socket
     * @returns IP address
     **/
    public getIP() {
        return this.ip;
    }

    /**
     * Get the user ID of this socket
     * @returns User ID
     **/
    public getUserID() {
        return this._id;
    }

    /**
     * Get the participant ID of this socket
     * @returns Participant ID
     **/
    public getParticipantID() {
        return this.id;
    }

    /**
     * Move this participant to a channel
     * @param _id Target channel ID
     * @param set Channel settings, if the channel is instantiated
     * @param force Whether to make this socket join regardless of channel properties
     **/
    public setChannel(_id: string, set?: Partial<IChannelSettings>, force = false) {
        // Do we exist?
        if (this.isDestroyed()) return;
        // Are we trying to join the same channel like an idiot?
        if (this.currentChannelID === _id) return;

        this.desiredChannel._id = _id;
        this.desiredChannel.set = set;

        let channel: Channel | undefined;

        //logger.debug(channelConfig.lobbyBackdoor);
        //logger.debug("Desired:", this.desiredChannel._id, "| Matching:", channelConfig.lobbyBackdoor, ",", this.desiredChannel._id == channelConfig.lobbyBackdoor);

        // Are we joining the lobby backdoor?
        if (this.desiredChannel._id == channelConfig.lobbyBackdoor) {
            // This is very likely not the original way the backdoor worked,
            // but considering the backdoor was changed sometime this decade
            // and the person who owns the original server is literally a
            // Chinese scammer, we don't really have much choice but to guess
            // at this point, unless a screenshot descends from the heavens above
            // and magically gives us all the info we need and we can fix it here.
            _id = "lobby";
            force = true;
        }

        // Find the first channel that matches the desired ID
        for (const ch of ChannelList.getList()) {
            if (ch.getID() == _id) {
                channel = ch;
            }
        }

        // Does channel exist?
        if (channel) {
            // Exists, call join
            (async () => {
                await this.loadUser();
                channel.join(this, force);
            })();
        } else {
            // Doesn't exist, create
            channel = new Channel(
                this.desiredChannel._id,
                this.desiredChannel.set,
                this
            );

            // Make them join the new channel
            channel.join(this, force);
        }
    }

    public admin = new EventEmitter();

    /**
     * Bind the message handlers to this socket (internal)
     **/
    private bindEventListeners() {
        for (const group of eventGroups) {
            if (group.id == "admin") {
                for (const event of group.eventList) {
                    this.admin.on(event.id, event.callback);
                }
            } else {
                // TODO Check event group permissions
                for (const event of group.eventList) {
                    this.on(event.id, event.callback);
                }
            }
        }
    }

    /**
     * Send this socket an array of messages
     * @param arr Array of messages to send
     **/
    public sendArray<EventID extends keyof ClientEvents>(
        arr: ClientEvents[EventID][]
    ) {
        if (this.isDestroyed() || !this.ws) return;
        this.ws.send(JSON.stringify(arr));
    }

    /**
     * Load this socket's user data
     **/
    private async loadUser() {
        let user = await readUser(this._id);

        if (!user || user == null) {
            //logger.debug("my fancy new ID:", this._id);
            await createUser(
                this._id,
                config.defaultName,
                createColor(this.ip),
                config.defaultFlags
            );

            user = await readUser(this._id);
        }

        this.user = user;
    }

    /**
     * Get this socket's user data
     * @returns User data
     **/
    public getUser() {
        if (this.user) {
            return this.user;
        }

        return null;
    }

    /**
     * Get this socket's user flags
     * @returns User flag object
     **/
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

    /**
     * Set a user flag on this socket
     * @param key ID of user flag to change
     * @param value Value to change the user flag to
     **/
    public async setUserFlag(key: keyof UserFlags, value: unknown) {
        if (this.user) {
            try {
                const flags = JSON.parse(this.user.flags) as Partial<UserFlags>;
                if (!flags) return false;
                (flags as unknown as Record<string, unknown>)[key] = value;
                this.user.flags = JSON.stringify(flags);
                await updateUser(this.user.id, this.user);
                return true;
            } catch (err) {
                return false;
            }
        } else {
            return false;
        }
    }

    /**
     * Get this socket's participant data
     * @returns Participant object
     **/
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
                id: this.getParticipantID()
            };
        } else {
            return null;
        }
    }

    private destroyed = false;

    /**
     * Forcefully close this socket's connection and remove them from the server
     **/
    public destroy() {
        // Socket was closed or should be closed, clear data
        // logger.debug("Destroying UID:", this._id);

        const foundCh = ChannelList.getList().find(
            ch => ch.getID() === this.currentChannelID
        );

        // logger.debug("(Destroying) Found channel:", foundCh);

        if (foundCh) {
            foundCh.leave(this);
        }

        // Simulate closure
        try {
            if (this.ws) this.ws.close();
        } catch (err) {
            logger.warn("Problem closing socket:", err);
        }

        this.destroyed = true;
    }

    /**
     * Test if this socket is destroyed
     * @returns Whether this socket is destroyed
     **/
    public isDestroyed() {
        return this.destroyed == true;
    }

    /**
     * Get this socket's current cursor position
     * @returns Cursor position object
     **/
    public getCursorPos() {
        if (!this.cursorPos)
            this.cursorPos = {
                x: "-10.00",
                y: "-10.00"
            };
        return this.cursorPos;
    }

    /**
     * Set this socket's current cursor position
     * @param x X coordinate
     * @param y Y coordinate
     **/
    public setCursorPos(x: CursorValue, y: CursorValue) {
        if (typeof x == "number") {
            x = x.toFixed(2);
        }

        if (typeof y == "number") {
            y = y.toFixed(2);
        }

        if (!this.cursorPos) this.cursorPos = { x, y };
        this.cursorPos.x = x;
        this.cursorPos.y = y;

        // Send through channel
        const ch = this.getCurrentChannel();
        if (!ch) return;

        const part = this.getParticipant();
        if (!part) return;

        let pos = {
            x: this.cursorPos.x,
            y: this.cursorPos.y,
            id: this.getParticipantID()
        };

        ch.emit("cursor", pos);
    }

    /**
     * Get the channel this socket is in
     **/
    public getCurrentChannel() {
        return ChannelList.getList().find(
            ch => ch.getID() == this.currentChannelID
        );
    }

    /**
     * Send this socket a channel update message
     **/
    public sendChannelUpdate(ch: IChannelInfo, ppl: Participant[]) {
        this.sendArray([
            {
                m: "ch",
                ch,
                p: this.getParticipantID(),
                ppl
            }
        ]);
    }

    /**
     * Change this socket's name/color
     * @param name Desired name
     * @param color Desired color
     * @param admin Whether to force this change
     **/
    public async userset(
        name?: string,
        color?: string,
        admin: boolean = false
    ) {
        let isColor = false;

        // Color changing
        if (color && (config.enableColorChanging || admin)) {
            isColor =
                typeof color === "string" && !!color.match(/^#[0-9a-f]{6}$/i);
        }

        if (typeof name !== "string") return;
        if (name.length > 40) return;

        await updateUser(this._id, {
            name: typeof name == "string" ? name : undefined,
            color: color && isColor ? color : undefined
        });

        await this.loadUser();

        const ch = this.getCurrentChannel();

        if (ch) {
            let part = this.getParticipant() as Participant;
            let cursorPos = this.getCursorPos();

            ch.sendArray([
                {
                    m: "p",
                    _id: part._id,
                    color: part.color,
                    id: part.id,
                    name: part.name,
                    x: cursorPos.x,
                    y: cursorPos.y
                }
            ]);
        }
    }

    /**
     * Set a list of rate limits on this socket
     * @param list List of constructed rate limit objects
     **/
    public setRateLimits(list: RateLimitConstructorList) {
        this.rateLimits = {
            normal: {},
            chains: {}
        } as RateLimitList;

        for (const key of Object.keys(list.normal)) {
            (this.rateLimits.normal as any)[key] = (list.normal as any)[key]();
        }

        for (const key of Object.keys(list.chains)) {
            (this.rateLimits.chains as any)[key] = (list.chains as any)[key]();
        }
    }

    /**
     * Reset this socket's rate limits to the defaults
     **/
    public resetRateLimits() {
        // TODO Permissions
        let isAdmin = false;
        let ch = this.getCurrentChannel();
        let hasNoteRateLimitBypass = false;

        try {
            const flags = this.getUserFlags();

            if (flags) {
                if (flags["no note rate limit"]) {
                    hasNoteRateLimitBypass = true;
                }
            }
        } catch (err) {
            logger.warn("Unable to get user flags while processing rate limits");
        }

        if (isAdmin) {
            this.setRateLimits(adminLimits);
            this.setNoteQuota(NoteQuota.PARAMS_OFFLINE);
        } else if (this.isOwner()) {
            this.setRateLimits(crownLimits);
            this.setNoteQuota(NoteQuota.PARAMS_RIDICULOUS);
        } else if (ch && ch.isLobby()) {
            this.setRateLimits(userLimits)
            this.setNoteQuota(NoteQuota.PARAMS_LOBBY);
        } else {
            this.setRateLimits(userLimits);
            this.setNoteQuota(NoteQuota.PARAMS_NORMAL);
        }
    }

    /**
     * Set this socket's note quota
     * @param params Note quota params object
     **/
    public setNoteQuota(params = NoteQuota.PARAMS_NORMAL) {
        this.noteQuota.setParams(params as any); // TODO why any

        // Send note quota to client
        this.sendArray([
            {
                m: "nq",
                allowance: this.noteQuota.allowance,
                max: this.noteQuota.max,
                maxHistLen: this.noteQuota.maxHistLen
            }
        ]);
    }

    /**
     * Make this socket play a note in the channel they are in
     * @param msg Note message from client
     **/
    public playNotes(msg: ServerEvents["n"]) {
        const ch = this.getCurrentChannel();
        if (!ch) return;
        ch.playNotes(msg, this);
    }

    private isSubscribedToChannelList = false;

    /**
     * Start sending this socket the list of channels periodically
     **/
    public subscribeToChannelList() {
        if (this.isSubscribedToChannelList) return;

        ChannelList.subscribe(this.id);

        const firstList = ChannelList.getPublicList().map(v =>
            v.getInfo(this._id)
        );
        this.sendChannelList(firstList);

        this.isSubscribedToChannelList = true;
    }

    /**
     * Stop sending this socket the list of channels periodically
     **/
    public unsubscribeFromChannelList() {
        if (!this.isSubscribedToChannelList) return;
        ChannelList.unsubscribe(this.id);
        this.isSubscribedToChannelList = false;
    }

    /**
     * Send a channel list to this socket
     * @param list List of channels to send
     * @param complete Whether this list is the complete list of channels or just a partial list
     **/
    public sendChannelList(list: IChannelInfo[], complete = true) {
        // logger.debug(
        //     "Sending channel list:",
        //     list,
        //     complete ? "(complete)" : "(incomplete)"
        // );

        this.sendArray([
            {
                m: "ls",
                c: complete,
                u: list
            }
        ]);
    }

    /**
     * Determine if this socket has the crown in the channel they are in
     * @returns Whether or not they have ownership in the channel
     **/
    public isOwner() {
        const channel = this.getCurrentChannel();
        const part = this.getParticipant();

        if (!channel) return false;
        if (!channel.crown) return false;
        if (!channel.crown.userId) return false;
        if (!channel.crown.participantId) return false;
        if (!part) return;
        if (!part.id) return;
        if (channel.crown.participantId !== part.id) return false;

        return true;
    }

    /**
     * Make this socket kick a user in their channel
     * @param _id User ID to kick
     * @param ms Amount of time in milliseconds to ban the user for
     * @param admin Whether or not to force this change (skips checking channel ownership)
     **/
    public kickban(_id: string, ms: number, admin = false) {
        const channel = this.getCurrentChannel();

        if (!channel) return;

        if (this.isOwner() || admin) {
            channel.kickban(_id, ms, this.getUserID());
        }
    }

    /**
     * Make this socket unban a user in their channel
     * @param _id User ID to unban
     * @param admin Whether or not to force this change (skips checking channel ownership)
     **/
    public unban(_id: string, admin = false) {
        const channel = this.getCurrentChannel();

        if (!channel) return;

        if (this.isOwner() || admin) {
            channel.unban(_id);
        }
    }

    /**
     * Get this socket's UUID
     **/
    public getUUID() {
        return this.uuid;
    }

    /**
     * Send this socket a notification message
     * @param notif Notification data to send
     *
     * Example:
     * ```ts
     * socket.sendNotification({
     *     title: "Notice",
     *     text: `Banned from "${this.getID()}" for ${Math.floor(t / 1000 / 60)} minutes.`,
     *     duration: 7000,
     *     target: "#room",
     *     class: "short"
     * });
     * ```
     **/
    public sendNotification(notif: Notification) {
        this.sendArray([{
            m: "notification",
            id: notif.id,
            target: notif.target,
            duration: notif.duration,
            class: notif.class,
            title: notif.title,
            text: notif.text,
            html: notif.html
        }]);
    }

    /**
     * Set this socket's user's tag
     * @param text Text of the tag
     * @param color Color of the tag
     **/
    public setTag(text: string, color: string) {
        const user = this.getUser();
        if (!user) return;
        user.tag = JSON.stringify({ text, color });
        updateUser(this.getUserID(), user);
    }

    /**
     * Execute code in this socket's context (danger warning)
     * @param str JavaScript expression to execute
     **/
    public eval(str: string) {
        try {
            const output = eval(str);
            logger.info(output);
        } catch (err) {
            logger.error(err);
        }
    }
}

export const socketsBySocketID = new Map<string, Socket>();

export function findSocketByPartID(id: string) {
    for (const socket of socketsBySocketID.values()) {
        if (socket.getParticipantID() == id) return socket;
    }
}

export function findSocketsByUserID(_id: string) {
    const sockets = [];

    for (const socket of socketsBySocketID.values()) {
        // logger.debug("User ID:", socket.getUserID());
        if (socket.getUserID() == _id) sockets.push(socket);
    }

    return sockets;
}

export function findSocketByIP(ip: string) {
    for (const socket of socketsBySocketID.values()) {
        if (socket.getIP() == ip) {
            return socket;
        }
    }
}
