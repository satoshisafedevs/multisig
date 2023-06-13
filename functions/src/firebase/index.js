const {
    auth,
    db,
    error,
    log,
    onRequest,
    onDocumentCreated,
    onDocumentUpdated,
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
    onDocumentUpdated,
    createOrUpdatePrivateKey,
    getPrivateKey,
    deleteSecret,
    deletePrivateKeyVersion,
    getPrivateKeyVersion,
};
