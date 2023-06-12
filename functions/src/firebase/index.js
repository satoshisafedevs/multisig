const {
    auth,
    db,
    error,
    log,
    onRequest,
    onDocumentCreated,
} = require("./firebase");
const {
    createOrUpdatePrivateKey,
    getPrivateKey,
    deleteSecret,
    deletePrivateKeyVersion,
    getPrivateKeyVersion,
} = require("./secretManager");

module.exports = {
    auth,
    db,
    error,
    log,
    onRequest,
    onDocumentCreated,
    createOrUpdatePrivateKey,
    getPrivateKey,
    deleteSecret,
    deletePrivateKeyVersion,
    getPrivateKeyVersion,
};
