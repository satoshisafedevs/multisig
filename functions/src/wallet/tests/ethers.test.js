const { assert } = require("chai");
const { getLatestBlock } = require("../ethers");

describe("Ethers Optimism connection", function() {
    this.timeout(5000); // set the test timeout to 5 seconds
    it("should return the latest block number", async () => {
        const block = await getLatestBlock();
        assert.isNumber(block.number);
    });
});

