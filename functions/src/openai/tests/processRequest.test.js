const { processRequest } = require("../processRequest");
const chai = require("chai");
const expect = chai.expect;

describe("Parse OpenAI request", () => {
    it.skip("should parse the JSON string", async () => {
        const sampleString =
        `{"action": "CLAIM_GMX", "parameters": {}, "message": 
        "Sure, I can help you claim GMX rewards.", "blockchain": "Arbitrum"}`;
        const result = await processRequest(sampleString);
        expect(result.action).to.equal("CLAIM_GMX");
    });
});
