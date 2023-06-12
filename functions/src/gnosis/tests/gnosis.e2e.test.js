require("dotenv").config();
const chai = require("chai");
const expect = chai.expect;
const { getProvider, loadWallet, getEthersAdapter } = require("../../wallet");
const { createSafe } = require("../gnosis");

describe("Gnosis Safe", () => {
    describe("#createSafe", async () => {
        xit("should create a gnosis safe for a valid network", async () => {
            const network = "arbitrum-goerli";
            const provider = await getProvider(network);
            const pKey = process.env.PRIVATE_KEY;
            const wallet = await loadWallet(pKey, provider);
            console.log(wallet);
            const ethAdapter = await getEthersAdapter(wallet);
            console.log(ethAdapter);
            const safe = await createSafe(ethAdapter);
            expect(safe).to.have.property("address");
            expect(safe).to.have.property("nonce");
            expect(safe).to.have.property("masterCopy");
            expect(safe).to.have.property("fallbackHandler");
            expect(safe).to.have.property("version");
            expect(safe).to.have.property("threshold");
            expect(safe).to.have.property("owners");
            expect(safe).to.have.property("modules");
            expect(safe).to.have.property("guard");
        });
    });
});
