import { ChannelSettings } from "../util/types";

type Validator = "boolean" | "string" | "number" | ((val: any) => boolean);

const validationRecord: Record<keyof ChannelSettings, Validator> = {
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
 * @param set Unknown data
 * @returns Record of which settings are correct
 */
export function validateChannelSettings(set: Partial<ChannelSettings>) {
    // Create record
    let keys = Object.keys(validationRecord);
    let record: Partial<Record<keyof ChannelSettings, boolean>> = {};

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
        record[key as keyof ChannelSettings] = validate(val, validator);
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
