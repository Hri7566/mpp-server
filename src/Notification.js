module.exports = class Notification {
    constructor (data) {
        this.id = data.id;
        this.chat = data.chat;
        this.refresh = data.refresh;
        this.title = data.title;
        this.text = data.text;
        this.html = data.html;
        this.target = data.target;
        this.duration = data.duration;
        this.class = data.class;
        this.id = data.id;
    }

    send(_id, room) {
        let obj = {};
        Object.assign(obj, this);
        obj.m = "notification";

        switch (_id) {
            case "all": {
                for (let con of Array.from(room.server.connections.values())) {
                    con.sendArray([obj]);
                }
                break;
            }
            case "room": {
                for (let con of room.connections) {
                    con.sendArray([obj]);
                }
                break;
            }
            default: {
                Array.from(room.server.connections.values()).filter((usr) => typeof(usr.user) !== 'undefined' ? usr.user._id == _id : null).forEach((p) => {
                    p.sendArray([obj]);
                });
            }
        }
    }
}
