require("dotenv").config();
const nodemailer = require("nodemailer");
const { generateEmailContent } = require("./generateEmailContent");

async function sendHtmlEmail(toEmail, userMessage, username, userEmail, teamName, inviteLink) {
    try {
        const transporter = nodemailer.createTransport({
            host: "mail.smtp2go.com", // SMTP2GO server
            port: 2525, // use 8025, 587 or 25 alternatively
            auth: {
                user: process.env.SMTP2GO_USERNAME, // generated SMTP2GO user
                pass: process.env.SMTP2GO_PASSWORD, // generated SMTP2GO password
            },
        });

        const htmlBody = generateEmailContent(username, userEmail, teamName, userMessage, inviteLink);

        const mailOptions = {
            from: '"Satoshi Safe" <noreply@satoshisafe.io>', // sender address
            to: toEmail, // list of receivers
            subject: "Invitation to Join Satoshi Safe Team", // Subject line
            html: htmlBody, // generated html body
        };

        const info = await transporter.sendMail(mailOptions);

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error(error);
        return error;
    }
}

module.exports = {
    sendHtmlEmail,
};
