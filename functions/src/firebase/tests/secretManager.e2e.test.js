const chai = require("chai");
const expect = chai.expect;
const secrets = require("../secretManager"); // adjust this to your file structure

describe("Secret Manager", function () {
    this.timeout(60000); // these tests can be slow

    let testSecretId;
    const testPrivateKey = "testPrivateKey";
    let keyLocation;
    let keyLocationWithVersion;

    before(async () => {
        // create a unique ID for the test secret
        testSecretId = `test-secret-${Date.now()}`;
        keyLocation = `projects/${JSON.parse(process.env.FIREBASE_CONFIG).projectId}/secrets/${testSecretId}`;
        keyLocationWithVersion = `projects/${
            JSON.parse(process.env.FIREBASE_CONFIG).projectId
        }/secrets/${testSecretId}/versions/latest`;
    });

    it("should create a new secret", async () => {
        const secret = await secrets.createOrUpdatePrivateKey(testSecretId, testPrivateKey);
        expect(secret).to.have.property("name");
    });

    it("should retrieve the latest secret", async () => {
        const secret = await secrets.getPrivateKey(keyLocationWithVersion);
        expect(secret).to.equal(testPrivateKey);
    });

    it("should create a new version of the secret", async () => {
        this.timeout(5000); // wonder if this will help with test intermittent failure
        const secret = await secrets.createOrUpdatePrivateKey(testSecretId, "newTestPrivateKey");
        expect(secret).to.have.property("name");
        this.timeout(5000); // wonder if this will help with test intermittent failure
        const newSecret = await secrets.getPrivateKey(keyLocationWithVersion);
        expect(newSecret).to.equal("newTestPrivateKey");
    });

    it("should retrieve a specific version of the secret", async () => {
        const secret = await secrets.getPrivateKeyVersion(keyLocation, "1");
        expect(secret).to.equal(testPrivateKey);
    });

    it("should delete a secret", async () => {
        await secrets.deleteSecret(keyLocation);
    });
});
