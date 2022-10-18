class Command {
    constructor(id, args, desc, usage, func, permLevel) {
        this.id = id;
        this.args = args || [id];
        this.desc = desc || 'no description'; // brandon-like words
        this.usage = usage || 'no usage';
        this.func = func;
        this.permLevel = permLevel || 'admin'; // user / admin?
    }
}

module.exports = {
    Command
}
