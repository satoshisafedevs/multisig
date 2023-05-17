const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const { error, log } = require("firebase-functions/logger");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated } = require("firebase-functions/v2/firestore");

initializeApp();

const db = getFirestore();
const auth = getAuth();

module.exports = {
    auth,
    db,
    error,
    log,
    onRequest,
    onDocumentCreated,
};
