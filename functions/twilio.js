const Twilio = require("twilio");
require("dotenv").config();

const twilioClient = new Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
);

async function sendMessage(text, phoneNum) {
    twilioClient.messages.create({
        body: text,
        to: phoneNum,
        from: process.env.TWILIO_NUMBER,
    });
}

module.exports = {
    twilioClient,
    sendMessage,
};
