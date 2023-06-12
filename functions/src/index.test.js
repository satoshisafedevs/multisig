const path = require("path");
const keyPath = path.resolve(__dirname, "../serviceAccountKey.json");
require("firebase-functions-test")({
    databaseURL: "https://prontoai-playground.firebaseio.com",
    storageBucket: "prontoai-playground.appspot.com",
    projectId: "prontoai-playground",
}, keyPath);
