import { config } from "../ws/usersConfig";
import jsonwebtoken from "jsonwebtoken";
import env from "./env";
import { readFileSync } from "fs";
import { Logger } from "./Logger";
import { readUser, updateUser } from "../data/user";

let privkey: string;

if (config.tokenAuth == "jwt") {
    privkey = readFileSync("./mppkey").toString();
}

const logger = new Logger("TokenGen");

export function generateToken(id: string): Promise<string | undefined> | undefined {
    if (config.tokenAuth == "jwt") {
        if (!privkey) throw new Error("Private key not found");

        logger.info("Generating JWT token for user " + id + "...");

        return new Promise((resolve, reject) => {
            jsonwebtoken.sign({ id }, privkey, { algorithm: "RS256" }, (err, token) => {
                if (err || !token) {
                    logger.warn("Token generation failed for user " + id);
                    reject(err);
                }

                logger.info("Token generation finished for user " + id);
                resolve(token);
            });
        });
    } else if (config.tokenAuth == "uuid") {
        logger.info("Generating UUID token for user " + id + "...");

        return new Promise(async (resolve, reject) => {
            let token: string | undefined;

            try {
                const uuid = crypto.randomUUID();
                token = `${id}.${uuid}`;

                // Save token in user data
                const user = await readUser(id);
                if (!user) throw new Error("User not found");

                if (!user.tokens) user.tokens = "[]";

                const tokens = JSON.parse(user.tokens);
                tokens.push(token);

                user.tokens = JSON.stringify(tokens);
                await updateUser(user.id, user);
            } catch (err) {
                logger.warn("Token generation failed for user " + id);
                reject(err);
            }

            if (!token) reject(new Error("Token generation failed for user " + id));

            logger.info("Token generation finished for user " + id);

            if (token) resolve(token);
        });
    } else return new Promise(() => undefined);
}

export async function verifyToken(token: string) {
    if (config.tokenAuth !== "none") {
        // Get tokens from user data
        const user = await readUser(token.split(".")[0]);
        if (!user) return false;

        if (!user.tokens) return false;

        const tokens = JSON.parse(user.tokens);
        if (!tokens) return false;

        // Check if the token is in the list
        for (const tok of tokens) {
            if (tok === token) return true;
        }
    }

    return false;
}

export async function decryptJWT(token: string) {
    if (config.tokenAuth != "jwt") return undefined;

    if (!privkey) throw new Error("Cannot decrypt JWT without private key loaded");

    return jsonwebtoken.decode(token);
}
