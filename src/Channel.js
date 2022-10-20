class ChannelSettings {
    static VALID = {
        "lobby": "boolean",
        "visible": "boolean",
        "chat": "boolean",
        "crownsolo": "boolean",
        "no cussing": "boolean",
        "lyrical notes": "boolean",
        "color": function(val) {
            return typeof val === "string" && val.match(/^#[0-9a-f]{6}$/i);
        },
        "color2": function(val) {
            return typeof val === "string" && val.match(/^#[0-9a-f]{6}$/i);
        },
        "owner_id": "string"
    };
}

const LOBBY_SETTINGS = {
    color: '#73b3cc',
    color2: '#273546',
    lobby: true,
}

class Channel extends EventEmitter {
    settings = {
        chat: true,
        color: '#73b3cc',
        color2: '#273546',
    }

    constructor(_id, settings) {
        this._id = _id;
        this.settings = ChannelSettings.verifySettings(settings);
    }
}

module.exports = {
    Channel
}
