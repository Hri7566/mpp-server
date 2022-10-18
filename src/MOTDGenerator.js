const Holidays = require('date-holidays');

let hd = new Holidays();

hd.init('US');

class MOTDGenerator {
    static getDay() {
        let now = new Date();
        let start = new Date(now.getFullYear(), 0, 0);
        let diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
        let oneDay = 1000 * 60 * 60 * 24;
        let day = Math.floor(diff / oneDay);
        return day;
    }

    static getCurrentMOTD() {
        let h = hd.isHoliday(Date.now());
        if (h) {
            // maybe holiday
            return `Happy ${h[0].name}`;
        } else {
            // no holiday
            return 'cotton-headed ninnymuggins'
        }
    }
}

module.exports = {
    MOTDGenerator
}
