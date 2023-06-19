require("dotenv").config();
const chai = require("chai");
const expect = chai.expect;
const { providers } = require("ethers");
const { EthersAdapter } = require("@safe-global/protocol-kit");
const { getLatestBlock, getProvider, getEthersAdapter } = require("../ethers");

describe("Ethers e2e Tests", () => {
    describe("#getProvider()", () => {
        it("should return a provider for a valid network", async () => {
            const network = "goerli";
            const provider = await getProvider(network);

            expect(provider).to.be.instanceOf(providers.AlchemyProvider);
        });

        it("should throw an error for an invalid network", async () => {
            const network = "invalidNetwork";

            try {
                await getProvider(network);
            } catch (error) {
                expect(error).to.be.an("error");
                expect(error.message).to.equal("Invalid network");
            }
        });
        it("should return an ethers adapter for a valid network", async () => {
            const network = "goerli";
            const provider = await getProvider(network);
            const ethersAdapter = await getEthersAdapter(provider);

            expect(ethersAdapter).to.be.instanceOf(EthersAdapter);
        });
    });

    describe("#getLatestBlock()", () => {
        it("should return the latest block", async () => {
            const network = "goerli";
            const provider = await getProvider(network);
            const block = await getLatestBlock(provider);

            expect(block).to.have.property("number");
            expect(block).to.have.property("hash");
            // add more checks as necessary
        });
    });
});
