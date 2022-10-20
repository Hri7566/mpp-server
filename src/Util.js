class Util {
    static getHHMMSSMS() {
        let ms = Number(new Date(new Date().toLocaleString('en-US', {
            timeZone: 'America/New_York'
        })));

        let ss = ms / 1000;
        let mm = ss / 60;
        let hh = mm / 60;

        ms %= 1000;
        ss %= 60;
        mm %= 60;
        hh %= 12;

        return {
            hh: Math.floor(hh).toString().padStart(2, '0'),
            mm: Math.floor(mm).toString().padStart(2, '0'),
            ss: Math.floor(ss).toString().padStart(2, '0'),
            ms: Math.floor(ms).toString().padStart(2, '0')
        }
    }

    /**
     * Mix keys from another object into the first
     * @param {*} obj1 Object to modify
     * @param {*} obj2 Object with keys to add to obj1
     */
    static mixin(obj1, obj2) {
        for (let key of Object.keys(obj2)) {
            obj1[key] = obj2[key];
        }
    }
}

module.exports = {
    Util
}
