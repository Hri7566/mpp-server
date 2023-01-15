const fs = require('fs');
const { promisify } = require('util');
const createKeccakHash = require('keccak');
const ColorEncoder = require('./ColorEncoder');
const UserModel = require('./UserModel');
const mongoose = require('mongoose');
const level = require('level');
const { users } = require('./UserModel');
const { inventories } = require('./InventoryModel');
const Logger = require('./Logger');

var logger = new Logger("Database");

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 1000
}, err => {
    if (err) {
        console.error(err);
        logger.error("Unable to connect to database service");
        process.exit(1);
    }
    logger.log("Connected");
});

class Database {
    static userdb;
    static roomdb;

    static async load() {
        this.userdb = mongoose.connection;
        this.roomdb = level('db/rooms.db');
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
        if (!this.userdb) {
            await this.load();
        }
        
        let _id = createKeccakHash('keccak256').update((cl.server._id_Private_Key + cl.ip)).digest('hex').substr(0, 24);
        let user = await UserModel.findOne({ _id: _id }).exec();
        
        if (user == null) {
            user = this.createUser(_id);
        }

        return user;
    }

    static async createUser(_id) {
        if (!this.userdb) {
            await this.load();
        }

        let user = new UserModel({
            name: "Anonymous",
            _id: _id,
            color: "#" + ColorEncoder.intToRGB(ColorEncoder.hashCode(_id)),
            flags: {

            }
        });
        user.save();
        return user;
    }

    static async updateUser(_id, data) {
        if (!this.userdb) {
            await this.load();
        }

        let user = await UserModel.findOne({_id: _id}).exec();
        
        user.name = data.name;
        user._id = data._id;
        user.flags = data.flags;
        user.color = data.color;

        await user.save();
    }

    static async wipe() {
        if (!this.userdb) {
            await this.load();
        }
        
        await UserModel.find({}, (err, docs) => {
            docs.forEach(doc => {
                doc.remove();
            });
        }).exec();
    }

    static strMapToObj(strMap) {
        return [...strMap.entries()].reduce((obj, [key, value]) => (obj[key] = value, obj), {});
    }

    static getRoomSettings(_id, cb) {
        let key = "room~"+_id;
        
        roomSettings
        
        this.roomdb.get(key, (err, value) => {
            if (err || !value || value == "") {
                cb(err, value);
                return;
            }
            cb(undefined, value);
        });
    }

    static setRoomSettings(_id, roomSettings, chat) {
        let roomData = new RoomDataModel(roomSettings, chat);
        let key = "room~"+_id;
        this.roomdb.put(key, JSON.stringify(roomData));
    }

    static getRoomSettings(_id, cb) {
        let key = "room~"+_id;
        this.roomdb.get(key, (err, value) => {
            if (err) {
                cb(err);
                return;
            }
            let settings = JSON.parse(value);
            cb(err, settings);
        });
    }

    static deleteRoomSettings(_id) {
        this.roomdb.del("room~"+_id);
    }
}

class RoomDataModel {
    constructor (settings, chat) {
        this.settings = settings;
        this.chat = chat;
    }
}

module.exports = Database;
