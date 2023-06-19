require("dotenv").config();
const chai = require("chai");
const expect = chai.expect;
const { setupWallet } = require("../../../wallet");
const { getSafesByOwner, loadSafe, createAndApproveTransaction } = require("../../../gnosis");
const { approve, swap } = require("../index");
const { utils } = require("ethers");
const networks = require("../../../networks");

describe("Uniswap Protocol", () => {
    const network = "optimism";
    const pKey = process.env.PRIVATE_EVM_KEY;
    let wallet; let ethAdapter; let safeService; let safes; let safeAddress; let safe;

    before(async () => {
        ({ wallet, ethAdapter, safeService } = await setupWallet(network, pKey));
        ({ safes } = await getSafesByOwner(safeService, wallet.address));
        safeAddress = safes[0];
        safe = await loadSafe(ethAdapter, safeAddress);
    });

    describe("#Approve Uniswap", () => {
        let tx = null;
        it("should create a new transaction given sample data", async () => {
            tx = approve(network, networks[network].contracts.snxToken, utils.parseUnits(".01", 18), wallet);
            expect(tx).to.have.property("data");
        });
        it.skip("should submit the transaction to the gnosis safe", async () => {
            const result = await createAndApproveTransaction(safe, safeService, safeAddress, tx, wallet);
            expect(result).to.be.true;
        });
    });
    describe("#Swap Uniswap", () => {
        let tx = null;
        it("should create a new transaction given sample data", async () => {
            tx = swap(
                network, safeAddress, wallet, networks[network].contracts.snxToken,
                networks[network].contracts.usdcToken,
                18, ".01",
            );
            expect(tx).to.have.property("data");
        });
        it.skip("should submit the transaction to the gnosis safe", async () => {
            const result = await createAndApproveTransaction(safe, safeService, safeAddress, tx, wallet);
            expect(result).to.be.true;
        });
    });
});
