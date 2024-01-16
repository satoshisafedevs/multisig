const { db } = require("../../firebase");
const chai = require("chai");
const expect = chai.expect;

describe("On user wallet changed update safe array", function () {
    this.timeout(150000);
    it.skip("should update the safes field", async () => {
        const userId = "testUser123";
        const teamId = "testTeam123";
        const documentPath = `users/${userId}/teams/${teamId}`;

        const data = {
            userWalletAddress: "0xc8eda2126c065464133d6A138172a540C9dDE945",
        };
        await db.doc(documentPath).set(data);
        let c = 0;
        let safes;
        while (c < 6) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            const teamDoc = await db.doc(documentPath).get();
            safes = teamDoc.data().safes;
            if (safes && safes.length > 0) {
                break;
            }
            c++;
            if (c >= 6) {
                throw new Error("Timeout - exceeded 12 seconds");
            }
        }
        expect(safes.length).to.be.greaterThan(0);
        for (const safe of safes) {
            expect(safe.network).to.not.be.undefined;
            expect(safe.safeAddress).to.not.be.undefined;
        }
    });
});
