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
    // Whether we have correctly processed this socket's hi message
    public hasProcessedHi = false;

    // Whether they have sent the MIDI devices message
    public hasSentDevices = false;

    // Whether they have sent a token
    public hasSentToken = false;

    // Whether their token is valid
    public isTokenValid = false;

    // Their user agent, if sent
    public userAgent = "";

    // Whether they have moved their cursor
    public hasCursorMoved = false;

    // Whether they sent a cursor message that contained numbers instead of stringified numbers
    public isCursorNotString = false;

    // The last time they sent a ping message
    public lastPing = Date.now();

    // Whether they have joined any channel
    public hasJoinedAnyChannel = false;

    // Whether they have joined the lobby
    public hasJoinedLobby = false;

    // Whether they have made a regular non-websocket request to the HTTP server
    // probably useful for checking if they are actually on the site
    // Maybe not useful if cloudflare is being used
    // In that scenario, templating wouldn't work, either
    public hasConnectedToHTTPServer = false;

    // Various chat message flags
    public hasSentChatMessage = false;
    public hasSentChatMessageWithCapitalLettersOnly = false;
    public hasSentChatMessageWithInvisibleCharacters = false;
    public hasSentChatMessageWithEmoji = false;

    // Whehter or not the user has played the piano in this session
    public hasPlayedPianoBefore = false;

    // Whether the user has sent a channel list subscription request, a.k.a. opened the channel list
    public hasOpenedChannelList = false;

    // Whether the user has changed their name/color this session (not just changed from default)
    public hasChangedName = false;
    public hasChangedColor = false;

    // Whether the user has sent
    public hasSentCustomNoteData = false;

    // Whether they sent an admin message that was invalid (wrong password, etc)
    public hasSentInvalidAdminMessage = false;

    // Whether or not they have passed the b message
    public hasCompletedBrowserChallenge = false;
}
