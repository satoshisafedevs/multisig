const {
    auth,
    db,
    error,
    log,
    onRequest,
    onDocumentCreated,
    onDocumentUpdated,
    onDocumentWritten,
    onSchedule,
    Timestamp,
    onCall,
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
    onSchedule,
    Timestamp,
    onCall,
};
