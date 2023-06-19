const { db } = require("../../firebase");
const { generateWallet } = require("../../wallet");
// const expect = chai.expect;

describe("On User Wallet Changed Trigger Tests", () => {
    describe("#getUserSafes", () => {
        it("should return safes for a valid network and address", async () => {
            const wallet = await generateWallet();
            db.collection("users").doc("testUser").collection("teams").doc("testTeam").set({
                userWalletAddress: wallet.address,
            });
        });
    });
});
