module.exports = {
    cors: ["prontoai-playground.web.app", "prontoai-playground.firebaseapp.com", "localhost:5173"],
    corsAndOptions: (req, res) => {
        res.set("Access-Control-Allow-Origin", "*");
        if (req.method === "OPTIONS") {
            res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
            res.status(204).send("");
        }
    },
};
