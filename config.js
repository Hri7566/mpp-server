module.exports = Object.seal({
    port: 8443,
    motd: "big th0nk",
    _id_PrivateKey: process.env.SALT,
    defaultUsername: "Anonymous",
    // defaultRoomColor: "#3b5054",
    defaultRoomColor: "#000000",
    // defaultLobbyColor: "#19b4b9",
    defaultLobbyColor: "#9900ff",
    // defaultLobbyColor2: "#801014",
    defaultLobbyColor2: "#801014",
    adminpass: process.env.ADMINPASS,
    ssl: true,
    defaultRoomSettings: {
        color: "#000000",
        crownsolo: false,
        visible: true
    }
});
