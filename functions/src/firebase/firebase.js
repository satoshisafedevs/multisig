const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { error, log } = require("firebase-functions/logger");
const { onRequest } = require("firebase-functions/v2/https");
const { onDocumentCreated, onDocumentUpdated, onDocumentWritten } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");

initializeApp();

// to test functions locally against real DB use code below and comment out above
// emulate command: firebase emulators:start --only functions --project playground
// const serviceAccount = require("../../serviceAccountKey.json");
// initializeApp({
//     credential: cert(serviceAccount),
// });

const db = getFirestore();
const auth = getAuth();

module.exports = {
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
};
