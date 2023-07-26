module.exports = {
    mainnet: {
        safeTransactionService: "https://safe-transaction-mainnet.safe.global/",
        deBankChainID: "eth",
    },
    // goerli: {
    //     safeTransactionService: "https://safe-transaction-goerli.safe.global/",
    //     contracts: {
    //         uniswap: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
    //     },
    // },
    // gnosis_chain: {
    //     safeTransactionService: "https://safe-transaction-gnosis-chain.safe.global/",
    // },
    arbitrum: {
        safeTransactionService: "https://safe-transaction-arbitrum.safe.global/",
        contracts: {
            gmxRewardRouter: "0xA906F338CB21815cBc4Bc87ace9e68c87eF8d8F1",
        },
        deBankChainID: "arb",
    },
    // avalanche: {
    //     safeTransactionService: "https://safe-transaction-avalanche.safe.global/",
    // },
    // aurora: {
    //     safeTransactionService: "https://safe-transaction-aurora.safe.global/",
    // },
    // bsc: {
    //     safeTransactionService: "https://safe-transaction-bsc.safe.global/",
    // },
    // base_goerli: {
    //     safeTransactionService: "https://safe-transaction-base-testnet.safe.global/",
    // },
    optimism: {
        safeTransactionService: "https://safe-transaction-optimism.safe.global/",
        oneInchBaseUrl: "https://api.1inch.io/v5.0/10",
        contracts: {
            uniswapv3: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
            snxToken: "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4",
            usdcToken: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        },
        deBankChainID: "op",
    },
    // polygon: {
    //     safeTransactionService: "https://safe-transaction-polygon.safe.global/",
    // },
};
