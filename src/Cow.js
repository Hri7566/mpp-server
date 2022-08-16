const ung = requre('unique-names-generator');

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
        this['🐄'] = Cow.generateRandomName();
    }
}

module.exports = {
    Cow
}
