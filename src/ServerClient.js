const { Logger } = require("./Logger");

class ServerClient {
    logger = new Logger("Client Instance");

    constructor(ws) {
        this.ws = ws;
        this.logger.log('Connected');

        console.log(Buffer.from(this.ws.getRemoteAddressAsText()).toString());
    }

    sendArray(msgs) {
        try {
            this.ws.send(JSON.stringify(msgs));
        } catch (err) {
            this.logger.error(err);
        }
    }

    isConnected() {
        
    }

    destroy() {
        this.ws.close();
    }
}

module.exports = {
    ServerClient
}
