import networks from "./networks.json";

export default async function checkNetwork(networkName) {
    // Check if the network configuration exists
    if (!networks[networkName]) {
        throw new Error(`Network configuration for ${networkName} not found`);
    }

    // Get the network configuration
    const networkConfig = networks[networkName];

    // Check if MetaMask is installed
    if (typeof window.ethereum === "undefined") {
        throw new Error("MetaMask is not installed");
    }

    try {
        // Request to switch to the target network
        await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: networkConfig.metamaskSettings.chainId }],
        });
    } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
            try {
                // Request to add the network to MetaMask
                await window.ethereum.request({
                    method: "wallet_addEthereumChain",
                    params: [{ ...networkConfig.metamaskSettings }],
                });
            } catch (addError) {
                // Handle errors when adding the network
                throw new Error(`Error adding ${networkName} network: ${addError.message}`);
            }
        } else {
            // Handle all other errors
            throw new Error(`Error switching to ${networkName} network: ${switchError.message}`);
        }
    }
}
