// Gray console text
export function unimportant(str: string) {
    return `\x1b[90m${str}\x1b[0m`;
}

// Pad time strings
export function padNum(
    num: number,
    padAmount: number,
    padChar: string,
    left: boolean = true
) {
    return left
        ? num.toString().padStart(padAmount, padChar)
        : num.toString().padEnd(padAmount, padChar);
}

// ArrayBuffer to text
export const decoder = new TextDecoder();
export const encoder = new TextEncoder();

// Property checks
export function hasOwn(obj: any, property: string | number | Symbol) {
    return (Object as unknown as any).hasOwn(obj, property);
}

// Channel color2
export function darken(hex: string) {
    try {
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);

        let newR = Math.min(r - 64, 0);
        let newG = Math.min(g - 64, 0);
        let newB = Math.min(b - 64, 0);

        return `#${newR.toString(16).padStart(2, "0")}${newG
            .toString(16)
            .padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`;
    } catch (err) {}
}

// Brandon made this literally eons ago and it's fucking hilarious
export function spoop_text(message: string) {
    var old = message;
    message = "";
    for (var i = 0; i < old.length; i++) {
        if (Math.random() < 0.9) {
            message += String.fromCharCode(
                old.charCodeAt(i) + Math.floor(Math.random() * 20 - 10)
            );
            //message[i] = String.fromCharCode(Math.floor(Math.random() * 255));
        } else {
            message += old[i];
        }
    }
    return message;
}

export function mixin(obj1: any, obj2: any) {
    for (const key of Object.keys(obj2)) {
        obj1[key] = obj2[key];
    }
}
