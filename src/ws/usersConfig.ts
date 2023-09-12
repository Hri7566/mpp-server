import { loadConfig } from "../util/config";
import { UserFlags } from "../util/types";

export interface UsersConfig {
    defaultName: string;
    defaultFlags: UserFlags;
    enableColorChanging: boolean;
    enableCustomNoteData: boolean;
}

export const usersConfigPath = "config/users.yml";

export const defaultUsersConfig = {
    defaultName: "Anonymous",
    defaultFlags: {
        volume: 100
    },
    enableColorChanging: false,
    enableCustomNoteData: true
};

// Importing this elsewhere causes bun to segfault
export const config = loadConfig<UsersConfig>(
    usersConfigPath,
    defaultUsersConfig
);
