const { auth, log, error } = require("../firebase");

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = async (req, res) => {
    log("Check if request is authorized with Firebase ID token");
    if (
        (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) &&
        !(req.cookies && req.cookies.__session)
    ) {
        error(
            "No Firebase ID token was passed as a Bearer token in the Authorization header.",
            "Make sure you authorize your request by providing the following HTTP header:",
            "Authorization: Bearer <Firebase ID Token>",
            'or by passing a "__session" cookie.',
        );
        res.status(403).send({ message: "Unauthorized" });
        return false;
    }
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
        log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split("Bearer ")[1];
    } else if (req.cookies) {
        log('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    } else {
        // No cookie
        res.status(403).send({ message: "Unauthorized" });
        return false;
    }
    try {
        const decodedIdToken = await auth.verifyIdToken(idToken);
        log(`ID Token correctly decoded, user email: ${decodedIdToken.email}, uid: ${decodedIdToken.uid}`);
        return true;
    } catch (err) {
        error("Error while verifying Firebase ID token:", err);
        res.status(403).send({ message: "Unauthorized" });
        return false;
    }
};

module.exports = { validateFirebaseIdToken };
