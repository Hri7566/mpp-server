import { Logger } from "../util/Logger";
import { IChannelSettings } from "../util/types";

type Validator = "boolean" | "string" | "number" | ((val: unknown) => boolean);

// This record contains the exact data Brandon used to check channel settings, down to the regex.
// It also contains things that might be useful to other people in the future (things that make me vomit)
const validationRecord: Record<keyof IChannelSettings, Validator> = {
    // Brandon
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

    // MPPClone (why?)
    limit: "number",
    noindex: "boolean"
};

/**
 * Check the validity of channel settings
 * @param set Dirty settings
 * @returns Record of which settings are correct
 */
export function validateChannelSettings(set: Partial<IChannelSettings>) {
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

        // Set valid status
        record[key as keyof IChannelSettings] = validate(val, validator);
    }

    return record;
}

export default validateChannelSettings;

export function validate(value: any, validator: Validator) {
    // What type of validator?
    if (typeof validator == "function") {
        // We are copying Zod's functionality
        return validator(value) === true;
    } else if (typeof value === validator) {
        return true;
    }

    return false;
}
