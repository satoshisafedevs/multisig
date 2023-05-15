const functions = require("firebase-functions");
const { onRequest, db } = require("../firebase");
const { verifySignature, handleFormResponse } = require("./typeformUtils");
require("dotenv").config();

exports.receivedForm = onRequest(async (req, res) => {
    if (req.method === "POST") {
        const signature = req.headers["typeform-signature"];
        const isValid = verifySignature(
            signature,
            `${JSON.stringify(req.body)}\n`,
        );
        functions.logger.log("Is signature valid:", isValid);
        if (isValid) {
            const formResponse = req.body["form_response"];
            const phoneNumber = formResponse.answers[0]["phone_number"];
            const userDocRef = db.collection("typeformData").doc(phoneNumber);
            const userDoc = await userDocRef.get();
            if (userDoc.exists) {
                functions.logger.log(
                    "Response with provided phone number already exists:",
                    phoneNumber,
                );
                res.status(500).send({ message: "Unprocessable entry" });
                return;
            }
            const [answersArray, answersObject] =
                handleFormResponse(formResponse);
            userDocRef.set({ answers: answersArray, ...answersObject });
            res.send("OK!");
            return;
        }
        res.status(403).send({ message: "Unauthorized" });
    } else res.status(404).send({ message: "Not allowed" });
});
