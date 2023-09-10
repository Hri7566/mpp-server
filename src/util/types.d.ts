import { Socket } from "../ws/Socket";

declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

declare type UserFlags = Partial<{
    freeze_name: number;
    "no chat rate limit": number;
    chat_curse_1: number;
    chat_curse_2: number;
    override_id: string;
    volume: number;
}>;

declare interface Tag {
    text: string;
    color: string;
}

declare interface User {
    _id: string; // user id
    name: string;
    color: string;
    tag?: Tag;
}

declare interface Participant extends User {
    id: string; // participant id (same as user id on mppclone)
}

declare type ChannelSettings = {
    color: string;
    crownsolo: boolean;
    chat: boolean;
    visible: boolean;
} & Partial<{
    color2: string;
    lobby: boolean;
    owner_id: string;
    "lyrical notes": boolean;
    "no cussing": boolean;

    limit: number;
    noindex: boolean;
}>;

declare type ChannelSettingValue = Partial<string | number | boolean>;

declare type NoteLetter = `a` | `b` | `c` | `d` | `e` | `f` | `g`;
declare type NoteOctave = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

declare interface Note {
    n: `${NoteLetter}${NoteOctave}`;
    d: number;
    v: number;
    s?: 1;
}

declare type Notification = Partial<{
    duration: number;
    class: string;
    id: string;
    title: string;
    text: string;
    html: string;
    target: string;
}>;

declare type CustomTarget = {
    global?: boolean;
} & (
    | {
          mode: "subscribed";
      }
    | {
          mode: "ids";
          ids: string[];
      }
    | {
          mode: "id";
          id: string;
      }
);

declare interface Crown {
    userId: string;
    partcipantId?: string;
    time: number;
    startPos: {
        x: number;
        y: number;
    };
    endPos: {
        x: number;
        y: number;
    };
}

declare interface ChannelInfo {
    banned?: boolean;
    count: number;
    id: string;
    _id: string;
    crown?: Crown;
    settings: Partial<ChannelSettings>;
}

// Events copied from Hri7566/mppclone-client typedefs
declare interface ServerEvents {
    a: {
        m: "a";
        message: string;
    };

    bye: {
        m: "bye";
    };

    ch: {
        m: "ch";
        _id: string;
        set: ChannelSettings;
    };

    chown: {
        m: "chown";
        id?: string;
    };

    chset: {
        m: "chset";
        set: ChannelSettings;
    };

    custom: {
        m: "custom";
        data: any;
        target: CustomTarget;
    };

    devices: {
        m: "devices";
        list: any[];
    };

    dm: {
        m: "dm";
        message: string;
        _id: string;
    };

    hi: {
        m: "hi";
        token?: string;
        login?: { type: string; code: string };
        code?: string;
    };

    kickban: {
        m: "kickban";
        _id: string;
        ms: number;
    };

    m: {
        m: "m";
        x?: string | number;
        y?: string | number;
    };

    "-custom": {
        m: "-custom";
    };

    "-ls": {
        m: "-ls";
    };

    n: {
        m: "n";
        t: number;
        n: Note[];
    };

    "+custom": {
        m: "+custom";
    };

    "+ls": {
        m: "+ls";
    };

    t: {
        m: "t";
        e: number;
    };

    unban: {
        m: "unban";
        _id: string;
    };

    userset: {
        m: "userset";
        set: { name?: string; color?: string };
    };

    // Admin

    color: {
        m: "color";
        _id: string;
        color: string;
    };

    name: {
        m: "name";
        _id: string;
        name: string;
    };

    user_flag: {
        m: "user_flag";
        _id: string;
        key: keyof UserFlags;
        value: UserFlags[keyof UserFlags];
    };
}

declare interface ClientEvents {
    a: {
        m: "a";
        a: string;
        p: Participant;
        t: number;
    };

    b: {
        m: "b";
        code: string;
    };

    c: {
        m: "c";
        c: IncomingMPPEvents["a"][];
    };

    ch: {
        m: "ch";
        p: string;
        ch: ChannelInfo;
        ppl: Participant[];
    };

    custom: {
        m: "custom";
        data: any;
        p: string;
    };

    hi: {
        m: "hi";
        t: number;
        u: User;
        permissions: any;
        token?: any;
        accountInfo: any;
    };

    ls: {
        m: "ls";
        c: boolean;
        u: ChannelInfo[];
    };

    m: {
        m: "m";
        x: number;
        y: number;
        id: string;
    };

    n: {
        m: "n";
        t: number;
        n: Note[];
        p: string;
    };

    notification: {
        m: "notification";
        duration?: number;
        class?: string;
        id?: string;
        title?: string;
        text?: string;
        html?: string;
        target?: string;
    };

    nq: {
        m: "nq";
        allowance: number;
        max: number;
        maxHistLen: number;
    };

    p: {
        m: "p";
        x: number;
        y: number;
    } & Participant;

    t: {
        m: "t";
        t: number;
        e: number;
    };
}

declare type ServerEventListener<EventID extends keyof ServerEvents> = {
    id: EventID;
    callback: (msg: ServerEvents[EventID], socket: Socket) => void;
};
