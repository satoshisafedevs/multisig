const { claim, unStakeGMX, stakeGMX } = require("../protocols/gmx");

const processRequest = async ({ action, message, params }) => {
    try {
        if (action) {
            switch (action) {
            case "CLAIM_GMX":
                return claim(params);
            case "STAKE_GMX":
                return stakeGMX(params);
            case "UNSTAKE_GMX":
                return unStakeGMX(params);
            default:
                return "Invalid action";
            }
        }
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    processRequest,
};
