require("dotenv").config();
const chai = require("chai");
const expect = chai.expect;
const sinon = require("sinon");
const nodemailer = require("nodemailer");

const { sendHtmlEmail } = require("../sendHtmlEmail"); // Adjust the path to the file where sendHtmlEmail is defined.

describe("Email Sending", () => {
    let stub;

    beforeEach(() => {
        stub = sinon.stub(nodemailer, "createTransport").returns({
            sendMail: sinon.fake.resolves("Message sent: 1234"),
        });
    });

    afterEach(() => {
        stub.restore();
    });

    it("should send an email", async () => {
        const response =
            await sendHtmlEmail("test@example.com",
                "Test Subject", "TestUsername", "testuser@example.com", "TestSafeName");
        expect(response).to.equal("Message sent: 1234");
        // This assertion assumes that your sendHtmlEmail function returns the message.
    });

    // You can add more test cases as needed.
});
