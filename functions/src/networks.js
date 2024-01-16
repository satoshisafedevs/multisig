module.exports = {
    mainnet: {
        safeTransactionService: "https://safe-transaction-mainnet.safe.global/",
        deBankChainID: "eth",
        id: 1,
        rpcUrl: "https://ethereum.publicnode.com", // Added from extracted RPC URLs
    },
    baseGoerli: {
        deBankChainID: "notavailable",
        safeTransactionService: "https://safe-transaction-base-testnet.safe.global/",
        id: 84531,
        rpcUrl: "https://goerli.base.org", // Added from extracted RPC URLs
    },
    // Other commented out networks can be added similarly if needed
    arbitrum: {
        safeTransactionService: "https://safe-transaction-arbitrum.safe.global/",
        contracts: {
            gmxRewardRouter: "0xA906F338CB21815cBc4Bc87ace9e68c87eF8d8F1",
        },
        deBankChainID: "arb",
        id: 42161,
        rpcUrl: "https://arbitrum-one.publicnode.com", // Added from extracted RPC URLs
    },
    avalanche: {
        safeTransactionService: "https://safe-transaction-avalanche.safe.global/",
        deBankChainID: "avax",
        id: 43114,
        rpcUrl: "https://avalanche-c-chain.publicnode.com", // Added from extracted RPC URLs
    },
    aurora: {
        safeTransactionService: "https://safe-transaction-aurora.safe.global/",
        deBankChainID: "aurora",
        id: 1313161554,
        rpcUrl: "https://mainnet.aurora.dev", // Added from extracted RPC URLs
    },
    bsc: {
        safeTransactionService: "https://safe-transaction-bsc.safe.global/",
        deBankChainID: "bsc",
        id: 56,
        rpcUrl: "https://bsc.publicnode.com", // Added from extracted RPC URLs
    },
    optimism: {
        safeTransactionService: "https://safe-transaction-optimism.safe.global/",
        rpcUrl: "https://optimism.meowrpc.com",
        contracts: {
            uniswapv3: "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45",
            snxToken: "0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4",
            usdcToken: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
        },
        deBankChainID: "op",
        id: 10,
    },
    polygon: {
        safeTransactionService: "https://safe-transaction-polygon.safe.global/",
        deBankChainID: "matic",
        rpcUrl: "https://polygon-bor.publicnode.com",
    },
    base: {
        safeTransactionService: "https://safe-transaction-base.safe.global/",
        deBankChainID: "base",
        id: 8453,
        rpcUrl: "https://base.publicnode.com",
    },
};
