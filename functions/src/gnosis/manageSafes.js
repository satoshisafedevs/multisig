const Safe = require("@safe-global/protocol-kit");
const { SafeFactory } = Safe;

async function createSafe(ethAdapter) {
    try {
        const safeFactory = await SafeFactory.create({ ethAdapter });
        const ownerAddress = await ethAdapter.getSignerAddress();
        const safeAccountConfig = {
            owners: [ownerAddress],
            threshold: 1,
        };
        const safe = await safeFactory.deploySafe({ safeAccountConfig, options: { gasLimit: 3000000 } });
        return safe;
    } catch (error) {
        console.error(error);
    }
}

async function loadSafe(ethAdapter, safeAddress) {
    try {
        const safe = await Safe.default.create({ ethAdapter, safeAddress });
        return safe;
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    createSafe,
    loadSafe,
};
