const fs = require("fs");
const { promisify } = require("util");
const createKeccakHash = require("keccak");
const ColorEncoder = require("./ColorEncoder");
// const UserModel = require("./UserModel");
// const mongoose = require("mongoose");
const level = require("level");
// const { db } = require("./UserModel");
const Logger = require("./Logger");
const { PrismaClient } = require("@prisma/client");

const logger = new Logger("Database");

// mongoose.connect(
//     process.env.MONGO_URL,
//     {
//         useNewUrlParser: true,
//         useUnifiedTopology: true,
//         connectTimeoutMS: 1000
//     },
//     err => {
//         if (err) {
//             console.error(err);
//             logger.error("Unable to connect to database service");
//             process.exit(1);
//         }
//         logger.log("Connected");
//     }
// );

// TODO implement this with an if statement instead
fs.mkdirSync("db/", {
    recursive: true
});

class Database {
    static userdb;
    static channeldb;
    static prisma = new PrismaClient();

    static async load() {
        // this.userdb = mongoose.connection;
        this.channeldb = level("db/rooms.db");
        this.bandb = level("db/ban.db");
        this.utildb = level("db/util.db");
        logger.log("Level stores initialized");

        // const writeFile = promisify(fs.writeFile);
        // const readdir = promisify(fs.readdir);

        // let files = await readdir("src/db/");
        // if (!files.includes("users.json")) {
        //     await writeFile('src/db/users.json', JSON.stringify(this.default_db, null, 2))
        //     this.userdb = new Map(Object.entries(require("./db/users.json")));
        // } else {
        //     this.userdb = new Map(Object.entries(require("./db/users.json")));
        // }
    }

    static async getUserData(cl, server) {
        // if (!this.userdb) {
        //     await this.load();
        // }

        let _id = createKeccakHash("keccak256")
            .update(cl.server._id_Private_Key + cl.ip)
            .digest("hex")
            .substr(0, 24);

        // let user = await UserModel.findById(_id).exec();
        // console.log("_id:", _id);
        // console.log("user:", user);

        let user = await this.prisma.users.findUnique({
            where: {
                id: _id
            }
        });

        if (user == null) {
            user = await this.createUser(_id);
        }

        const t = Date.now();
        user._id = user.id;
        delete user.id;
        return user;
    }

    static async createUser(_id) {
        // if (!this.userdb) {
        //     await this.load();
        // }

        // let user = new UserModel({
        //     name: "Anonymous",
        //     _id: _id,
        //     color: "#" + ColorEncoder.intToRGB(ColorEncoder.hashCode(_id)),
        //     flags: {}
        // });

        // user.save();

        console.log(_id);

        const user = await this.prisma.users.create({
            data: {
                name: "Anonymous",
                id: _id,
                color: "#" + ColorEncoder.intToRGB(ColorEncoder.hashCode(_id)),
                flags: {},
                v: 1
            }
        });

        return user;
    }

    static async updateUser(_id, data) {
        // if (!this.userdb) {
        //     await this.load();
        // }

        // let user = await UserModel.findOne({ _id: _id }).exec();

        // user.name = data.name;
        // user._id = data._id;
        // user.flags = data.flags;
        // user.color = data.color;

        // await user.save();

        await this.prisma.users.updateMany({
            where: {
                id: _id
            },
            data: {
                // id: data._id,
                name: data.name,
                color: data.color,
                flags: data.flags
            }
        });
    }

    static async wipe() {
        // if (!this.userdb) {
        //     await this.load();
        // }

        // await UserModel.find({}, (err, docs) => {
        //     docs.forEach(doc => {
        //         doc.remove();
        //     });
        // }).exec();

        await this.prisma.users.deleteMany();
    }

    static strMapToObj(strMap) {
        return [...strMap.entries()].reduce(
            (obj, [key, value]) => ((obj[key] = value), obj),
            {}
        );
    }

    static getChannelSettings(_id, cb) {
        let key = "room~" + _id;

        this.channeldb.get(key, (err, value) => {
            if (err || !value || value == "") {
                cb(err, value);
                return;
            }
            cb(undefined, value);
        });
    }

    static setChannelSettings(_id, channelSettings, chat) {
        let roomData = new RoomDataModel(channelSettings, chat);
        let key = "room~" + _id;
        this.channeldb.put(key, JSON.stringify(roomData));
    }

    static getChannelSettings(_id, cb) {
        let key = "room~" + _id;
        this.channeldb.get(key, (err, value) => {
            if (err) {
                cb(err);
                return;
            }
            let settings = JSON.parse(value);
            cb(err, settings);
        });
    }

    static deleteChannelSettings(_id) {
        if (!this.bandb) return this.load();
        this.channeldb.del("room~" + _id);
    }

    static addIPBan(ip) {
        if (!this.bandb) return this.load();
        this.bandb.put("ipban~" + ip, true);
    }

    static removeIPBan(ip) {
        if (!this.bandb) return this.load();
        this.bandb.del("ipban~" + ip);
    }

    static isIPBanned(ip, cb) {
        if (!this.bandb) {
            // FIXME this was causing a crash :/ maybe it should be async instead of return false?
            this.load();
            return false;
        }

        this.channeldb.get("ipban~" + ip, (err, value) => {
            if (err) {
                return false;
            }

            console.log("ban:", value);

            if (value == true) return true;
        });
    }

    static utilSet(key, value) {
        return this.utildb.put(key, value);
    }

    static utilGet(key) {
        return this.utildb.get(key);
    }

    static utilDel(key) {
        return this.utildb.del(key);
    }
}

class RoomDataModel {
    constructor(settings, chat) {
        this.settings = settings;
        this.chat = chat;
    }
}

Database.load();

module.exports = Database;
