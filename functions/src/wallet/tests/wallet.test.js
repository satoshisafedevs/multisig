const { expect } = require("chai");
const { generateWallet, loadWallet } = require("../wallet");

describe("Ethereum Wallet", () => {
    it("should generate a wallet with an address and a private key", async () => {
        const wallet = await generateWallet();
        expect(wallet).to.have.property("address");
        expect(wallet).to.have.property("privateKey");
    });

    it("should load a wallet from a private key", async () => {
        const wallet1 = await generateWallet();
        const wallet2 = await loadWallet(wallet1.privateKey);

        expect(wallet2.address).to.equal(wallet1.address);
        expect(wallet2.privateKey).to.equal(wallet1.privateKey);
    });
});
