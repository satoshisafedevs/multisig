const crypto = require("crypto");
const functions = require("firebase-functions");

const verifySignature = (receivedSignature, payload) => {
    functions.logger.log("Check if request is authorized with secret");
    const hash = crypto
        .createHmac("sha256", process.env.TYPEFORM_SECRET)
        .update(payload)
        .digest("base64");
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
