const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
    db,
    onRequest,
    auth,
};
