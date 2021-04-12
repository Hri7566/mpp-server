const fs = require('fs');
const { promisify } = require('util');
const createKeccakHash = require('keccak');
const ColorEncoder = require('./ColorEncoder');

class Database {
    static userdb;

    static async load() {
        const writeFile = promisify(fs.writeFile);
        const readdir = promisify(fs.readdir);

        let files = await readdir("src/db/");
        if (!files.includes("users.json")) {
            await writeFile('src/db/users.json', JSON.stringify(this.default_db, null, 2))
            this.userdb = new Map(Object.entries(require("./db/users.json")));
        } else {
            this.userdb = new Map(Object.entries(require("./db/users.json")));
        }
    }

    static async getUserData(cl, server) {
        if (!this.userdb || (this.userdb instanceof Map && [...this.userdb.entries()] == [])) {
            await this.load();
        }

        let _id = createKeccakHash('keccak256').update((cl.server._id_Private_Key + cl.ip)).digest('hex').substr(0, 24);
        let usertofind = this.userdb.get(_id);

        if (!usertofind) {
            if (typeof usertofind == 'object' && (usertofind.hasOwnProperty('name') && usertofind.name != this.server.defaultUsername)) return;

            this.userdb.set(_id, {
                "color": `#${ColorEncoder.intToRGB(ColorEncoder.hashCode(_id)).toLowerCase()}`,
                "name": server.defaultUsername,
                "_id": _id,
                "ip": cl.ip
            });

            this.update();
        }

        let user = this.userdb.get(_id);

        return user;
    }

    static async update() {
        const writeFile = promisify(fs.writeFile);
        await writeFile('src/db/users.json', JSON.stringify(this.strMapToObj(this.userdb), null, 2));
    }

    static strMapToObj(strMap) {
        return [...strMap.entries()].reduce((obj, [key, value]) => (obj[key] = value, obj), {});
    }
}

module.exports = Database;
