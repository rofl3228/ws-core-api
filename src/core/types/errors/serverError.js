class ServerError extends Error {
    constructor(message) {
        super(message);
    }
}

module.exports = ServerError;
