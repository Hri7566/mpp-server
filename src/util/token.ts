import { readFileSync } from "fs";
import { readUser, updateUser } from "../data/user";
import { Gateway } from "../ws/Gateway";
import { config } from "../ws/usersConfig";
import env from "./env";
import { Logger } from "./Logger";
import jwt from "jsonwebtoken";

const logger = new Logger("Tokens");

let key: string;

if (config.tokenAuth == "jwt") {
    key = readFileSync("./mppkey").toString();
}

/**
 * Get an existing token for a user
 * @param userID ID of user
 * @returns Token
 **/
export async function getToken(userID: string) {
    try {
        const user = await readUser(userID);

        if (!user) return;
        if (typeof user.tokens !== "string") return;

        const data = JSON.parse(user.tokens) as string[];
        return data[0];
    } catch (err) {
        logger.warn(`Unable to get token for user ${userID}:`, err);
    }
}

/**
 * Create a new token for a user
 * @param userID ID of user
 * @param gateway Socket gateway context
 * @returns Token
 **/
export async function createToken(userID: string, gateway: Gateway) {
    try {
        const user = await readUser(userID);

        if (!user) return;
        if (typeof user.tokens !== "string") user.tokens = "[]";

        const data = JSON.parse(user.tokens) as string[];
        let token = "";

        if (config.tokenAuth == "uuid") {
            token = userID + "." + crypto.randomUUID();
        } else if (config.tokenAuth == "jwt") {
            token = generateJWT(userID, gateway);
        }

        data.push(token);
        user.tokens = JSON.stringify(data);

        await updateUser(userID, user);
        return token;
    } catch (err) {
        logger.warn(`Unable to create token for user ${userID}:`, err);
    }
}

export function generateJWT(userID: string, gateway: Gateway) {
    const payload = {
        userID,
        gateway
    };

    return jwt.sign(payload, key, {
        algorithm: "RS256"
    });
}

/**
 * Validate a token
 * @param userID ID of user
 * @param token Token
 * @returns True if token is valid, false otherwise
 **/
export async function validateToken(userID: string, token: string) {
    try {
        const user = await readUser(userID);

        if (!user) {
            logger.warn(`Unable to validate token for user ${userID}: User not found, which is really weird`);
            return false;
        }

        if (typeof user.tokens !== "string") {
            user.tokens = "[]";
        }

        const data = JSON.parse(user.tokens) as string[];

        if (data.indexOf(token) !== -1) {
            return true;
        }

        return false;
    } catch (err) {
        logger.warn(`Unable to validate token for user ${userID}:`, err);
    }
}
