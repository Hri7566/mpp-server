module.exports = Object.seal({
    port: "8080",
    motd: "You agree to read this message.",
    _id_PrivateKey: process.env.SALT,
    defaultUsername: "Anonymous",
    defaultRoomColor: "#3b5054",
    defaultLobbyColor: "#19b4b9",
    defaultLobbyColor2: "#801014",
    adminpass: process.env.ADMINPASS
})
