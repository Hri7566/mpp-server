export function unimportant(str: string) {
    return `\x1b[90m${str}\x1b[0m`;
}

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
