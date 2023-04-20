const Database = require("./Database");

module.exports = class Cycle {
    static startOfDay = 0;
    static time = this.startOfDay;
    static endOfDay = 24;

    static cycleInterval = setInterval(() => {
        try {
            this.time = Database.utilGet("time");
        } catch (err) {
            this.time = 0;
        }

        this.time++;

        if (this.time > this.endOfDay) {
            this.time = this.startOfDay;
        }

        Database.utilSet("time", this.time);
    }, 60 * 1000);

    static getCurrentTime() {
        return this.time;
    }

    static getCurrentGenericTime() {
        if (this.time < 2) return "late night";
        if (this.time < 6) return "dawn";
        if (this.time < 12) return "morning";
        if (this.time < 14) return "day";
        if (this.time < 18) return "evening";
        if (this.time < 20) return "dusk";
        return "night";
    }
};
