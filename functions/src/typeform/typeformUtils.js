const sha256 = require("crypto-js/hmac-sha256");
const enc = require("crypto-js/enc-base64");
const { log } = require("../firebase");
require("dotenv").config();

const verifySignature = (receivedSignature, payload) => {
    log("Check if request is authorized with secret");
    const hash = sha256(payload, process.env.TYPEFORM_SECRET).toString(enc);
    return receivedSignature === `sha256=${hash}`;
};

const handleFormResponse = (formResponse) => {
    const answersArray = [];
    let answersObject = {};
    formResponse.definition.fields.forEach((item, idx) => {
        if (idx === 0) {
            return;
        }
        const questionIDs = [
            "jobTitle",
            "timeInPosition",
            "whatToAchieve",
            "coachingStyle",
            "timeZone",
            "reminderTimes",
            "shortTermGoal",
            "longTermGoal",
        ];
        const commonObj = {
            question: item.title,
            answer:
                formResponse.answers[idx].text ||
                formResponse.answers[idx].choice.label,
        };
        answersArray.push(commonObj);
        answersObject = {
            ...answersObject,
            [questionIDs[idx - 1] || "notDefined"]: commonObj,
        };
    });
    return [answersArray, answersObject];
};

module.exports = {
    verifySignature,
    handleFormResponse,
};
