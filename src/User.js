const Database = require("./Database");
const { Cow } = require('./Cow');

function hslToHex(h, s, l) {
    l /= 100;
    const a = s * Math.min(l, 1 - l) / 100;
    const f = n => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
}

class User {
    constructor(cl, data) {
        this.name = data.name;
        this.cl = cl;
        this._id = data._id;
        this.color = data.color;
        this.flags = typeof data.flags == "object" ? data.flags : {
            volume: 100,
            "no chat rate limit": false,
            freeze_name: false
        }
		
		this.inventory = {};
    }

    getPublicUser() {
        let t = {};
        t.name = this.name;
        t.color = this.color;
        t._id = this._id;
        return t;
    }

    checkFlags() {
        if (typeof(this.cl.server.specialIntervals[this._id]) == 'undefined') {
            this.cl.server.specialIntervals[this._id] = {};
        }
        if (this.hasFlag('rainbow', true)) {
            if (!this.cl.server.specialIntervals[this._id].hasOwnProperty('rainbow')) {
                let h = Math.floor(Math.random() * 360);
                let s = 50;
                let l = 50;

                let hvel = 5;
                let svel = 1;
                let lvel = 0.5;

                this.cl.server.specialIntervals[this._id].rainbow = setInterval(() => {
                    hvel = Math.floor(Math.random()*10);
                    h += hvel;
                    if (h > 360) h = 0;

                    s += svel;
                    if (s >= 100 || s <= 50) {
                        svel = -svel;
                    }

                    l += lvel;
                    if (l >= 75 || l <= 25) {
                        lvel = -lvel;
                    }

                    this.color = hslToHex(h, s, l);
                    Database.updateUser(this._id, this);

                    this.cl.channel.updateParticipant(this._id, this);
                }, 1000 / 15);
            }
        } else if (this.hasFlag('rainbow', false)) {
            this.stopFlagEvents();
        }
    }

    stopFlagEvents() {
        let ints = this.cl.server.specialIntervals[this._id];
        if (!ints) {
            this.cl.server.specialIntervals[this._id] = {};
            ints = this.cl.server.specialIntervals[this._id];
        }
        if ('rainbow' in ints) {
            clearInterval(this.cl.server.specialIntervals[this._id].rainbow);
            delete this.cl.server.specialIntervals[this._id].rainbow;
        }
    }

    hasFlag(flag, val) {
        if (!val) return this.flags.hasOwnProperty(flag);
        return this.flags.hasOwnProperty(flag) && this.flags[flag] == val;
    }

    setFlag(flag, val) {
        if (typeof(this.flags[flag]) == 'undefined') {
            this.flags[flag] = val;
        }
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

