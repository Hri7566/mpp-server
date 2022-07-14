const Color = require("./Color");

function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 

function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   {number}  h       The hue
 * @param   {number}  s       The saturation
 * @param   {number}  l       The lightness
 * @return  {Array}           The RGB representation
 */
 function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var hue2rgb = function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }

        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function getTimeColor(currentDate = new Date()) {
    // get day of year as a number from 1-365
    let newYearsDay = new Date(currentDate.getFullYear());
    let differenceInTime = (currentDate - newYearsDay) + ((newYearsDay.getTimezoneOffset() - currentDate.getTimezoneOffset()) * 60 * 1000);
    let oneDayInMS = 1000 * 60 * 60 * 24;
    let dayOfYear = Math.ceil(differenceInTime / oneDayInMS);

    // get hour
    let hours = currentDate.getHours();
    let seconds = currentDate.getSeconds();

    // get a hue based on time of day and day of year
    let h = Math.floor((dayOfYear / 365) * 100) / 10000;
    let s = (hours + 1) / (24 / 3);
    // let s = 1;
    let l = 0.25 + Math.floor(((hours / 60)) * 1000) / 1000;
    
    if (l > 0.5) l = 0.5;
    if (s > 1) s = 1;

    // convert to rgb
    let [r, g, b] = hslToRgb(h, s, l);

    let col = new Color(r, g, b);
    return col;
}

module.exports = {
    hashCode,
    intToRGB,
    getTimeColor,
    hslToRgb
}
