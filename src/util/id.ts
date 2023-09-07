import { createHash, randomBytes } from "crypto";
import env from "./env";

export function createID() {
    return randomBytes(12).toString("hex");
}

export function createUserID(ip: string) {
    return createHash("sha-256").update(ip).update(env.SALT).digest("hex");
}
