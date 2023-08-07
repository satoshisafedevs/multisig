const { expect } = require("chai");
const { getAssetsByTeam } = require("../assets");
const fs = require("fs");

describe("Assets", () => {
    it.skip("should get assets for a teamId", async () => {
        const teamId = "xwBMi9j8rgrUampwJmwN";
        const assets = await getAssetsByTeam(teamId);
        expect(assets).to.be.an("array");
        fs.writeFile("output.json", JSON.stringify(assets), (err) => {
            if (err) throw err;
            console.log("Data written to file");
        });
    });
});
