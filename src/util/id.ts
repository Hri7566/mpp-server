import { createHash, randomBytes } from "crypto"; import env from "./env";
import { spoop_text } from "./helpers";

export function createID() {
    // Maybe I could make this funnier than it needs to be...
    // return randomBytes(12).toString("hex");

    let weirdness = "";
    while (weirdness.length < 24) {
        const time = new Date().toString();
        const randomShit = spoop_text(time); // looks like this: We]%Cau&:,\u0018403*"32>8,B15&GP[2)='7\u0019-@etyhlw\u0017QqXqiime&Khhe-

        let index1 = Math.floor(Math.random() * randomShit.length);
        let index2 = Math.floor(Math.random() * randomShit.length);

        weirdness += randomShit.substring(index1, index2);
    }

    // Get 12 bytes
    return Buffer.from(weirdness.substring(0, 12)).toString("hex");
}

export function createUserID(ip: string) {
    return createHash("sha256")
        .update(ip)
        .update(env.SALT)
        .digest("hex")
        .substring(0, 24);
}

export function createSocketID() {
    return crypto.randomUUID();
}

export function createColor(ip: string) {
    return (
        "#" +
        createHash("sha256")
            .update(ip)
            .update(env.SALT)
            .digest("hex")
            .substring(24, 24 + 6)
    );
}
