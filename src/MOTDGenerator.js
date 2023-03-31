const Holidays = require("date-holidays");

let hd = new Holidays();

hd.init("US");

let dayOfTheWeekMOTD = [
    "Happy Sunday!",
    "You can chat with that thing.",
    "I'm tired...",
    "Don't forget to bring a towel!",
    "Never lick a pole in winter.",
    "Everyone loves a potato monkey!",
    "Dear Mario: Please come to the castle. I've baked a cake for you. Yours truly-- Princess Toadstool"
];

class MOTDGenerator {
    static getDay() {
        let now = new Date();
        let start = new Date(now.getFullYear(), 0, 0);
        let diff =
            now -
            start +
            (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
        let oneDay = 1000 * 60 * 60 * 24;
        let day = Math.floor(diff / oneDay);
        return day;
    }

    static getCurrentMOTD() {
        let h = hd.isHoliday(Date.now());
        if (h) {
            // maybe holiday
            return `Happy ${h[0].name}!`;
        } else {
            // no holiday, get day
            // let day = new Date().getDay();
            let newYearsDay = new Date(new Date().getFullYear());
            let differenceInTime =
                new Date() -
                newYearsDay +
                (newYearsDay.getTimezoneOffset() -
                    new Date().getTimezoneOffset()) *
                    60 *
                    1000;
            let oneDayInMS = 1000 * 60 * 60 * 24;
            let dayOfYear = Math.ceil(differenceInTime / oneDayInMS);
            dayOfYear %= 365;

            return dayOfTheWeekMOTD[dayOfYear % dayOfTheWeekMOTD.length];
        }
    }
}

module.exports = {
    MOTDGenerator
};
