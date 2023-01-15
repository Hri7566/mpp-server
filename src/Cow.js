const ung = require('unique-names-generator');

const ung_config = {
    dictionaries: [ung.adjectives, ung.colors],
    separator: ' ',
    length: 2
}

class Cow {
    static generateRandomName() {
        return ung.uniqueNamesGenerator(ung_config);
    }

    constructor() {
        this['display_name'] = Cow.generateRandomName();
		this['emoji'] = '🐄'
		this['count'] = 1;
    }
}

module.exports = {
    Cow
}
