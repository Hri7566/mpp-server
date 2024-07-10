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
        private ws: ServerWebSocket<{ ip: string }>,
        public socketID: string
    ) {
        super();
        this.ip = ws.data.ip;

        // User ID
        this._id = createUserID(this.getIP());
        this.uuid = crypto.randomUUID();

        // Check if we're already connected
        // We need to skip ourselves, so we loop here instead of using a helper
        let foundSocket;
        let count = 0;

        for (const socket of socketsBySocketID.values()) {
            if (socket.socketID == this.socketID || socket.ws.readyState !== 1) continue;

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

    public getIP() {
        return this.ip;
    }

    public getUserID() {
        return this._id;
    }

    public getParticipantID() {
        return this.id;
    }

    public setChannel(_id: string, set?: Partial<IChannelSettings>, force: boolean = false) {
        if (this.isDestroyed()) return;
        if (this.currentChannelID === _id) {
            logger.debug("Guy in channel was already in");
            return;
        }

        this.desiredChannel._id = _id;
        this.desiredChannel.set = set;

        let channel;
        for (const ch of ChannelList.getList()) {
            if (ch.getID() == _id) {
                channel = ch;
            }
        }

        // Does channel exist?
        if (channel) {
            // Exists, join normally
            (async () => {
                await this.loadUser();
                channel.join(this);
            })();
        } else {
            // Doesn't exist, create
            channel = new Channel(
                this.desiredChannel._id,
                this.desiredChannel.set,
                this
            );

            channel.join(this, force);
        }
    }

    public admin = new EventEmitter();

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
                config.defaultName,
                createColor(this.ip),
                config.defaultFlags
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
            this.ws.close();
        } catch (err) {
            logger.warn("Problem closing socket:", err);
        }

        this.destroyed = true;
    }

    public isDestroyed() {
        return this.destroyed == true;
    }

    public getCursorPos() {
        if (!this.cursorPos)
            this.cursorPos = {
                x: "-10.00",
                y: "-10.00"
            };
        return this.cursorPos;
    }

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

        ch.sendArray([
            {
                m: "m",
                id: part.id,
                x: this.cursorPos.x,
                y: this.cursorPos.y
            }
        ]);
    }

    public getCurrentChannel() {
        return ChannelList.getList().find(
            ch => ch.getID() == this.currentChannelID
        );
    }

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

    public resetRateLimits() {
        // TODO Permissions
        let isAdmin = false;
        let ch = this.getCurrentChannel();

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

    public playNotes(msg: ServerEvents["n"]) {
        const ch = this.getCurrentChannel();
        if (!ch) return;
        ch.playNotes(msg, this);
    }

    private isSubscribedToChannelList = false;

    public subscribeToChannelList() {
        if (this.isSubscribedToChannelList) return;

        ChannelList.subscribe(this.id);

        const firstList = ChannelList.getPublicList().map(v =>
            v.getInfo(this._id)
        );
        this.sendChannelList(firstList);

        this.isSubscribedToChannelList = true;
    }

    public unsubscribeFromChannelList() {
        if (!this.isSubscribedToChannelList) return;
        ChannelList.unsubscribe(this.id);
        this.isSubscribedToChannelList = false;
    }

    public sendChannelList(list: IChannelInfo[], complete: boolean = true) {
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

    public kickban(_id: string, ms: number) {
        const channel = this.getCurrentChannel();

        if (!channel) return;

        if (this.isOwner()) {
            channel.kickban(_id, ms, this.getUserID());
        }
    }

    public getUUID() {
        return this.uuid;
    }

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

    public setTag(text: string, color: string) {
        const user = this.getUser();
        if (!user) return;
        user.tag = JSON.stringify({ text, color });
        updateUser(this.getUserID(), user);
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
