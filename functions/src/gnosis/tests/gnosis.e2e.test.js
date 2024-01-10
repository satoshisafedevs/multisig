require("dotenv").config();
const chai = require("chai");
const { utils } = require("ethers");
const expect = chai.expect;
const { setupWallet } = require("../../wallet");
const { createSafe, loadSafe } = require("../manageSafes");
const { getSafesByOwner, getSafeInfo, getAllTransactions } = require("../safeService");
const { convertNestedArrays } = require("../sanitizeTxs");

describe("Gnosis Safe", async () => {
    const network = "arbitrum";
    const pKey = process.env.PRIVATE_EVM_KEY;
    let safeAddress = null;
    const { wallet, ethAdapter, safeService } = await setupWallet(network, pKey);
    let unSanitizedTxs = null;

    describe("#createSafe", async () => {
        it.skip("should create a gnosis safe for a valid network", async () => {
            await createSafe(ethAdapter);
        });
    });

    describe("#getSafesByOwner, #getSafeInfo", () => {
        it("should return a list of safes for a valid owner", async () => {
            const { safes } = await getSafesByOwner(safeService, "0x15C3c3E0444bC58aad1c3b27d196016F9E28bC70");
            expect(safes).to.be.an("array");
            safes.map(async (safe) => {
                expect(utils.isAddress(safe)).to.be.true;
                // add more assertions based on the properties each safe is expected to have
                const safeInfo = await getSafeInfo(safeService, safe);
                expect(safeInfo).to.have.property("owners");
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
            unSanitizedTxs = transactions.results;
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

    describe("#sanitizeAllTransactions", () => {
        it("should return a list of sanitized transactions", async () => {
            const sanitisedData = unSanitizedTxs.map((t) => convertNestedArrays(t));
            expect(sanitisedData).to.be.an("array");
        });
    });
});
