require("dotenv").config();
const chai = require("chai");
const expect = chai.expect;
const { utils } = require("ethers");
const { setupWallet } = require("../../../wallet");
const { getSafesByOwner, loadSafe, createAndApproveTransaction } = require("../../../gnosis");
const { claim, stakeGMX, unStakeGMX } = require("../rewardRouter");

describe("GMX Protocol", () => {
    const network = "arbitrum";
    const pKey = process.env.PRIVATE_EVM_KEY;
    let wallet; let ethAdapter; let safeService; let safes; let safeAddress; let safe;

    before(async () => {
        ({ wallet, ethAdapter, safeService } = await setupWallet(network, pKey));
        ({ safes } = await getSafesByOwner(safeService, wallet.address));
        safeAddress = safes[0];
        safe = await loadSafe(ethAdapter, safeAddress);
    });

    describe("#Claim GMX Rewards", () => {
        let tx = null;
        it("should create a new claim transaction", async () => {
            const params = {
                "_shouldClaimGmx": true,
                "_shouldStakeGmx": true,
                "_shouldClaimEsGmx": true,
                "_shouldStakeEsGmx": true,
                "_shouldStakeMultiplierPoints": true,
                "_shouldClaimWeth": true,
                "_shouldConvertWethToEth": true,
            };
            const paramsArray = Object.values(params);
            tx = claim(network, paramsArray, wallet);
            expect(tx).to.have.property("data");
        });
        it.skip("should submit the transaction to the gnosis safe", async () => {
            const result = await createAndApproveTransaction(safe, safeService, safeAddress, tx, wallet);
            expect(result).to.be.true;
        });
    });
    describe("#Stake GMX", () => {
        let tx = null;
        it("should stake GMX available", async () => {
            const amount = utils.parseUnits("1", 18);
            tx = stakeGMX(network, amount, wallet);
            expect(tx).to.have.property("data");
        });
        it.skip("should submit the transaction to the gnosis safe", async () => {
            const result = await createAndApproveTransaction(safe, safeService, safeAddress, tx, wallet);
            expect(result).to.be.true;
        });
    });
    describe("#Unstake GMX", () => {
        let tx = null;
        it("should unstake GMX available", async () => {
            const amount = utils.parseUnits("1", 18);
            tx = unStakeGMX(network, amount, wallet);
            expect(tx).to.have.property("data");
        });
        it.skip("should submit the transaction to the gnosis safe", async () => {
            const result = await createAndApproveTransaction(safe, safeService, safeAddress, tx, wallet);
            expect(result).to.be.true;
        });
    });
});
