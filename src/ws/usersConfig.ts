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

// Now that I look back at this, using this elsewhere
// before calling other things tends to make bun segfault?
// Not dealing with it. The code somehow runs, and I'm not
// going to fuck with the order of loading things until bun
// pushes an update and fucks all this stuff up.
export const config = loadConfig<UsersConfig>(
    usersConfigPath,
    defaultUsersConfig
);
