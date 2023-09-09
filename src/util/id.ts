import { createHash, randomBytes } from "crypto";
import env from "./env";

export function createID() {
    return randomBytes(12).toString("hex");
}

export function createUserID(ip: string) {
    return createHash("sha256")
        .update(ip)
        .update(env.SALT)
        .digest("hex")
        .substring(0, 24);
}

export function createColor(ip: string) {
    return (
        "#" +
        createHash("sha256")
            .update(ip)
            .update(env.SALT)
            .update("color")
            .digest("hex")
            .substring(0, 6)
    );
}
