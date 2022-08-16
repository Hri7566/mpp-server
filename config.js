module.exports = Object.seal({
    port: 8443,
    motd: "humongous clement",
    _id_PrivateKey: process.env.SALT,

    // defaultLobbyColor: "#19b4b9",
    // defaultLobbyColor2: "#801014",
    defaultLobbyColor: "#76b0db",
    defaultLobbyColor2: "#276491",
    // defaultLobbyColor: "#9900ff",
    // defaultLobbyColor2: "#5900af",

    defaultUsername: "Anonymous",
    adminpass: process.env.ADMINPASS,
    ssl: process.env.SSL,
    defaultRoomSettings: {
        // color: "#3b5054",
        // color2: "#001014",

        color: "#480505",
        crownsolo: false,
        visible: true
    },

    hostDevFiles: false,
    enableMPPCloneBot: true
});
