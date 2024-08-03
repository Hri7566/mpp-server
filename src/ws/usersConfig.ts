import { loadConfig } from "../util/config";
import { Participant, UserFlags } from "../util/types";

export interface UsersConfig {
    defaultName: string;
    defaultFlags: UserFlags;
    enableColorChanging: boolean;
    enableCustomNoteData: boolean;
    enableTags: boolean;
    adminParticipant: Participant;
    enableAdminEval: boolean;
    tokenAuth: "jwt" | "uuid" | "none";
    browserChallenge: "none" | "obf" | "basic";
    idGeneration: "random" | "sha256" | "mpp" | "uuid";
    colorGeneration: "random" | "sha256" | "mpp" | "white";
}

export const usersConfigPath = "config/users.yml";

export const defaultUsersConfig: UsersConfig = {
    defaultName: "Anonymous",
    defaultFlags: {
        volume: 100
    },
    enableColorChanging: false,
    enableCustomNoteData: true,
    enableTags: false,
    adminParticipant: {
        _id: "0",
        name: "mpp",
        color: "#fff",
        id: "0"
    },
    enableAdminEval: false,
    tokenAuth: "none",
    browserChallenge: "none",
    idGeneration: "mpp",
    colorGeneration: "mpp"
};

// Importing this elsewhere causes bun to segfault

// Now that I look back at this, using this elsewhere
// before calling other things tends to make bun segfault?
// Not dealing with it. The code somehow runs, and I'm not
// going to fuck with the order of loading things until bun
// pushes an update and fucks all this stuff up.
export const config = loadConfig<UsersConfig>(
    usersConfigPath,
    defaultUsersConfig
);
