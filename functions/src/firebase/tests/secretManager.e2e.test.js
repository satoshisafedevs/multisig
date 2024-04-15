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

    it.skip("should create a new secret", async () => {
        const secret = await secrets.createOrUpdatePrivateKey(testSecretId, testPrivateKey);
        expect(secret).to.have.property("name");
    });

    it.skip("should retrieve the latest secret", async () => {
        const secret = await secrets.getPrivateKey(keyLocationWithVersion);
        expect(secret).to.equal(testPrivateKey);
    });

    it.skip("should create a new version of the secret", async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const secret = await secrets.createOrUpdatePrivateKey(testSecretId, "newTestPrivateKey");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        expect(secret).to.have.property("name");
        const newSecret = await secrets.getPrivateKey(keyLocationWithVersion);
        expect(newSecret).to.equal("newTestPrivateKey");
    });

    it.skip("should retrieve a specific version of the secret", async () => {
        const secret = await secrets.getPrivateKeyVersion(keyLocation, "1");
        expect(secret).to.equal(testPrivateKey);
    });

    it.skip("should delete a secret", async () => {
        await secrets.deleteSecret(keyLocation);
    });
});
