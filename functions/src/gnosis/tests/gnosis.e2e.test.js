require("dotenv").config();
const chai = require("chai");
const { utils } = require("ethers");
const expect = chai.expect;
const { setupWallet } = require("../../wallet");
const { createSafe, loadSafe } = require("../manageSafes");
const { getSafesByOwner, getAllTransactions } = require("../safeService");

describe("Gnosis Safe", async () => {
    const network = "optimism";
    const pKey = process.env.PRIVATE_EVM_KEY;
    let safeAddress = null;
    const { wallet, ethAdapter, safeService } = await setupWallet(network, pKey);

    describe("#createSafe", async () => {
        it.skip("should create a gnosis safe for a valid network", async () => {
            await createSafe(ethAdapter);
        });
    });

    describe("#getSafesByOwner", () => {
        it("should return a list of safes for a valid owner", async () => {
            const { safes } = await getSafesByOwner(safeService, wallet.address);
            expect(safes).to.be.an("array");
            safes.forEach((safe) => {
                expect(utils.isAddress(safe)).to.be.true;
                // add more assertions based on the properties each safe is expected to have
            });
            safeAddress = safes[0];
        });
    });

    describe("#getAllTransactions", () => {
        it("should return a list of transactions for a valid safe address", async () => {
            const transactions = await getAllTransactions(safeService, safeAddress);
            expect(transactions.results).to.be.an("array");
            transactions.results.forEach((transaction) => {
                expect(transaction).to.have.property("to");
                expect(transaction).to.have.property("data");
                // add more assertions based on the properties each transaction is expected to have
            });
        });
    });

    describe("#loadSafeByAddress", () => {
        let safe = null;
        it("should load a safe with the correct owner and address", async () => {
            safe = await loadSafe(ethAdapter, safeAddress);
        });
        it("should create a new transaction given sample data", async () => {
            const safeTransactionData = {
                to: wallet.address,
                value: utils.parseEther("0.01"),
                data: "0x",
            };
            const tx = await safe.createTransaction({
                safeTransactionData,
            });
            expect(tx).to.have.property("data");
        });
    });
});
