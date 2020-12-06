class ServerClientError extends Error {
    constructor(message) {
        super(message);
    }
}

module.exports = ServerClientError;
