import { createHash, randomBytes } from "crypto"; import env from "./env";
import { spoop_text } from "./helpers";
import { config } from "../ws/usersConfig";

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
    if (config.idGeneration == "random") {
        return createID();
    } else if (config.idGeneration == "sha256") {
        return createHash("sha256")
            .update(ip)
            .update(env.SALT)
            .digest("hex")
            .substring(0, 24);
    } else if (config.idGeneration == "mpp") {
        return createHash("md5")
            .update("::ffff:" + ip + env.SALT)
            .digest("hex")
            .substring(0, 24);
    }
}

export function createSocketID() {
    return crypto.randomUUID();
}

export function createColor(_id: string) {
    if (config.colorGeneration == "random") {
        return "#" + Math.floor(Math.random() * 16777215).toString(16);
    } else if (config.colorGeneration == "sha256") {
        return "#" + createHash("sha256")
            .update(_id)
            .update(env.SALT)
            .digest("hex")
            .substring(24, 24 + 6);
    } else if (config.colorGeneration == "mpp") {
        const hash = createHash("md5");
        hash.update(_id + env.COLOR_SALT);
        const output = hash.digest();

        const r = output.readUInt8(0) - 0x40;
        const g = output.readUInt8(1) + 0x20;
        const b = output.readUInt8(2);

        return "#" + r.toString(16) + g.toString(16) + b.toString(16);
    } else if (config.colorGeneration == "white") {
        return "#ffffff";
    }
}
