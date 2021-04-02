module.exports = Object.seal({
    port: 8443,
    motd: "big th0nk",
    _id_PrivateKey: process.env.SALT,
    defaultUsername: "Anonymous",
    defaultRoomColor: "#3b5054",
    // defaultLobbyColor: "#19b4b9",
    defaultLobbyColor: "#5e32a8",
    defaultLobbyColor2: "#801014",
    adminpass: process.env.ADMINPASS
});
