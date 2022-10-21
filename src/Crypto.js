const crypto = require('crypto');

class Crypto {
    static random() {
        let hash = crypto.createHash('sha256');
        hash.update(Date.now().toString());
        hash.update(Math.random().toString());
        return hash.digest();
    }

    static randomID() {
        let magic = this.random();
        return magic.toString('hex').substring(0, 24);
    }

    static getUserID(ip) {
        let hash = crypto.createHash('sha256');
        hash.update(process.env.MPP_IDSALT);
        hash.update(ip);
        return hash.digest().toString('hex').substring(0, 24);
    }

    static getColor(_id) {
        let c = Buffer.from(_id, 16).toString('hex');
        return `#${c.substring(0, 6)}`;
    }
}

module.exports = {
    Crypto
}
