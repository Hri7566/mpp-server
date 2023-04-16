const Holidays = require("date-holidays");

let hd = new Holidays();

hd.init("US");

let dayOfTheWeekMOTD = [
    "Happy Sunday! (this message no longer only appears on Sunday)",
    "You can chat with that thing.",
    "I'm tired...",
    "Don't forget to bring a towel!",
    "Never lick a pole in winter.",
    "Everyone loves a potato monkey!",
    "Dear Mario: Please come to the castle. I've baked a cake for you. Yours truly-- Princess Toadstool",
    "The MotD generator is broken. Come back tomorrow.",
    "There's an earthbound battle background script in my frontend files.",
    "Lapis doesn't own this!",
    "https://youtube.com/hri7566",
    "The most Brandon-like MPP",
    "\"penis\" - Lapis",
    "\"I have an OnlyFans\" - Nitsua",
    "Sola's favorite site",
    "This site has the most admin features out of any MPP.",
    "This site is older than MPPClone.",
    "Brandon used to manually IP ban proxy lists from Google.",
    "Who else thinks Frackin Universe is overrated?",
    "Where is Fennece?",
    "Cosmic lives on the Chromatic Ribbon.",
    "Watch out for raining crowns!",
    "Tuesday is fishing day. (Monday if the fishing bot is in Germany)",
    "At the time of writing, Chris Pratt is overrated.",
    "MYHOUSE.WAD",
    "Ling Ling 40 Hours",
    "Do your job and watch new Mental Outlaw videos",
    "Amazon's AWS is way too overpriced and too time consuming",
    "This server has Brandon's official chat regex, courtesy of chacha.",
    "Neovim is better than vscode.",
    "All hail Cosmic",
    "You can chat with this thing.",
    "Don't let Foonix fall asleep in call again.",
    "Firebase is trash.",
    "distant cat sounds",
    "NOBODY EXPECTS THE SPANISH INQUISITION!",
    "Who will Billy Mitchell sue next?",
    "ayy lmao"
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
