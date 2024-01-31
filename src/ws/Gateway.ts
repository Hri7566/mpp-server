/**
 * I made this thing to keep track of what sockets
 * have and haven't done yet so we know if they
 * should be doing certain things.
 *
 * For instance, being logged in in the first place,
 * or if they're on shitty McDonalds WiFi and they
 * lost connection for over a minute, or if they
 * decided that they're going to put their browser
 * in a chokehold and force it to load weird shit...
 * or, you know, maybe I could log their user agent
 * and IP address instead sometime in the future.
 */
export class Gateway {
    public hasProcessedHi: boolean = false;
    public hasSentDevices: boolean = false;
    public lastPing: number = Date.now();
}
