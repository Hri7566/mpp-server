import { IChannelSettings } from "../util/types";

type Validator = "boolean" | "string" | "number" | ((val: unknown) => boolean);

// This record contains almost the exact code Brandon used to check channel settings, down to the regex.
// It also contains things that might be useful in the future, like MPPNet settings
const validationRecord: Record<keyof IChannelSettings, Validator> = {
    // Brandon's stuff
    lobby: "boolean",
    visible: "boolean",
    chat: "boolean",
    crownsolo: "boolean",
    "no cussing": "boolean",
    "lyrical notes": "boolean",
    color: val => {
        return typeof val === "string" && !!val.match(/^#[0-9a-f]{6}$/i);
    },
    color2: val => {
        return typeof val === "string" && !!val.match(/^#[0-9a-f]{6}$/i);
    },
    owner_id: "string",

    // MPPNet's stuff
    limit: val => {
        return typeof val === "number" && val <= 99 && val >= 0
    },
    noindex: "boolean"
};

// i made this
const adminOnlyKeys = [
    "lobby",
    "owner_id"
];

/**
 * Check the validity of channel settings
 * @param set Dirty settings
 * @returns Record of which settings are correct (true) and which ones aren't (false)
 */
export function validateChannelSettings(set: Partial<IChannelSettings>, admin = false) {
    // Create record
    let record: Partial<Record<keyof IChannelSettings, boolean>> = {};

    for (const key of Object.keys(set)) {
        let val = (set as Record<string, any>)[key];
        let validator = (
            validationRecord as Record<string, Validator | undefined>
        )[key];

        // Do we have a validator?
        if (!validator) {
            // Skip setting
            continue;
        }

        // Are we allowed?
        if (adminOnlyKeys.indexOf(key) !== -1 && !admin) continue;

        // Set valid status
        record[key as keyof IChannelSettings] = validate(val, validator);
    }

    return record;
}

export default validateChannelSettings;

export function validate(value: any, validator: Validator) {
    // What type of validator?
    if (typeof validator === "function") {
        // Run the function
        return validator(value) === true;
    } else if (typeof value === validator) {
        return true;
    }

    return false;
}
