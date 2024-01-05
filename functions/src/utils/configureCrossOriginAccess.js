const configureCrossOriginAccess = (req, res) => {
    const allowedOrigins = [
        "http://localhost:5173",
        "https://prontoai-playground.web.app/",
        "https://prontoai-playground.firebaseapp.com/",
        "https://playground.satoshisafe.ai/",
    ];

    const allowedOriginRegex = /^https:\/\/prontoai-playground.*\.web\.app$/;

    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin) || allowedOriginRegex.test(origin)) {
        res.set("Access-Control-Allow-Origin", origin);
        if (req.method === "OPTIONS") {
            res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
            res.status(204).send("");
            return true;
        }
    } else {
        res.status(400).send({ message: "You have no power here!" });
    }
    return false;
};

module.exports = { configureCrossOriginAccess };
