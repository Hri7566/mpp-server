const ung = require("unique-names-generator");

const ung_config = {
    dictionaries: [ung.names],
    separator: " ",
    length: 1
};

class Cow {
    static generateRandomName() {
        return ung.uniqueNamesGenerator(ung_config);
    }

    constructor() {
        this["display_name"] = Cow.generateRandomName();
        this["emoji"] = "🐄";
        this["count"] = 1;
    }

    toString() {
        return `${this.emoji}${this.display_name}${
            this.count > 1 ? `(x${this.count})` : ""
        }`;
    }
}

module.exports = {
    Cow
};
