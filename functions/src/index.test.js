const path = require("path");
const keyPath = path.resolve(__dirname, "../serviceAccountKey.json");
const test = require("firebase-functions-test")({
    databaseURL: "https://prontoai-playground.firebaseio.com",
    storageBucket: "prontoai-playground.appspot.com",
    projectId: "prontoai-playground",
}, keyPath);
const { db } = require("./firebase");
db.settings({
    host: "localhost:8080",
    ssl: false,
});

module.exports = {
    test,
};
