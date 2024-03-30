export const NETWORK_EIP = {
    mainnet: "eip155:1",
    polygon: "eip155:137",
    base: "eip155:8453",
    arbitrum: "eip155:42161",
    optimism: "eip155:10",
};

export const EIP155_SIGNING_METHODS = {
    PERSONAL_SIGN: "personal_sign",
    ETH_SIGN: "eth_sign",
    ETH_SIGN_TRANSACTION: "eth_signTransaction",
    ETH_SIGN_TYPED_DATA: "eth_signTypedData",
    ETH_SIGN_TYPED_DATA_V3: "eth_signTypedData_v3",
    ETH_SIGN_TYPED_DATA_V4: "eth_signTypedData_v4",
    ETH_SEND_RAW_TRANSACTION: "eth_sendRawTransaction",
    ETH_SEND_TRANSACTION: "eth_sendTransaction",
};
