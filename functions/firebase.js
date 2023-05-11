// firebase.js
const admin = require("firebase-admin");
const { onRequest } = require("firebase-functions/v2/https");
admin.initializeApp();

const db = admin.firestore();

module.exports = {
    db,
    onRequest,
};
