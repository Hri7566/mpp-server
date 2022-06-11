module.exports = Object.seal({
    port: 8443,
    motd: "big th0nk",
    _id_PrivateKey: process.env.SALT,
    defaultUsername: "Anonymous",
    // defaultRoomColor: "#3b5054",
    defaultRoomColor: "#480505",
    defaultLobbyColor: "#19b4b9",
    // defaultLobbyColor: "#76b0db",
    // defaultLobbyColor2: "#801014",
    defaultLobbyColor2: "#276491",
    // defaultLobbyColor: "#9900ff",
    // defaultLobbyColor2: "#5900af",
    adminpass: process.env.ADMINPASS,
    ssl: process.env.SSL,
    defaultRoomSettings: {
        color: "#3b5054",
        color2: "#001014",
        crownsolo: false,
        visible: true
    }
});
