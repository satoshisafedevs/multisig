const {
    auth,
    db,
    error,
    log,
    onRequest,
    onDocumentCreated,
    onDocumentUpdated,
    onDocumentWritten,
    Timestamp,
    onCall,
    functions,
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
    onDocumentWritten,
    onDocumentUpdated,
    Timestamp,
    onCall,
    functions,
};
