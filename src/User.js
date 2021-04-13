const Database = require("./Database");

class User {
    constructor(cl, data) {
        this.server = cl.server;
        this.name = typeof(data.name) == 'string' ? data.name : "Anonymous";
        this._id = data._id;
        this.color = data.color;
        this.ip = data.ip;
    }

    static updateUserModel(cl, user) {
        let u2 = new User(cl, user);
        if (typeof(u2) == 'undefined') return;

        for (let id in Object.keys(u2)) {
            if (!user.hasOwnProperty(id)) {
                user[id] = u2[id];
            }
        }
    }
}

module.exports = User;
