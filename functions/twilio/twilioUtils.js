const Twilio = require("twilio");

const twilioClient = new Twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN,
);

const sendMessage = async function(text, phoneNum) {
    twilioClient.messages.create({
        body: text,
        to: phoneNum,
        from: process.env.TWILIO_NUMBER,
    });
};

module.exports = {
    twilioClient,
    sendMessage,
};
