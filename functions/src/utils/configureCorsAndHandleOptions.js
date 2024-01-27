const configureCorsAndHandleOptions = (req, res) => {
    const allowedOrigins = [
        "http://localhost:5173",
        "https://prontoai-playground.web.app",
        "https://prontoai-playground.firebaseapp.com",
        "https://playground.satoshisafe.ai",
        "https://playground.satoshisafe.io",
        "https://satoshisafe.io",
    ];

    const allowedOriginRegex = /^https:\/\/prontoai-playground.*\.web\.app$/;

    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin) || allowedOriginRegex.test(origin)) {
        res.set("Access-Control-Allow-Origin", origin);
        res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
        res.set("Access-Control-Allow-Methods", "GET, POST, DELETE");
        if (req.method === "OPTIONS") {
            res.status(204).send("");
            return true;
        }
    } else {
        res.status(400).send({ message: "You have no power here!" });
        return true;
    }
    return false;
};

module.exports = { configureCorsAndHandleOptions };
