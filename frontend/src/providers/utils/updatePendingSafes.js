import { db, setDoc, doc } from "../../firebase";

const updatePendingSafes = async ({ filteredUserSafes, pendingSafes, safesToTxHash, currentTeam }) => {
    try {
        // First, filter out safesToTxHash based on filteredUserSafes
        const filteredSafesToTxHash = Object.keys(safesToTxHash)
            .filter((txHash) =>
                filteredUserSafes.some(
                    (safe) => safe.safeAddress.toLowerCase() === safesToTxHash[txHash].toLowerCase(),
                ),
            )
            .reduce((obj, key) => {
                const objy = { ...obj };
                objy[key] = safesToTxHash[key];
                return objy;
            }, {});

        // Then, iterate over pendingSafes to update their information with the safe address from filteredSafesToTxHash
        const updatedPendingSafes = pendingSafes.map((pendingSafe) => {
            const safeTxHash = pendingSafe.satoshiData.transactionHash;
            if (safeTxHash in filteredSafesToTxHash) {
                // Update pendingSafe with the corresponding safe address
                return { ...pendingSafe, safe: filteredSafesToTxHash[safeTxHash] };
            }
            return pendingSafe; // Return the safe unmodified if no update is needed
        });
        console.log("current filtered new safes", updatedPendingSafes);
        // Iterate over updatedPendingSafes and merge new data into the database
        updatedPendingSafes.forEach(async (pendingSafe) => {
            try {
                // With the modular API, the syntax to reference a document and set data changes slightly:
                const transactionDocRef = doc(db, "teams", currentTeam.id, "transactions", pendingSafe.id);
                await setDoc(
                    transactionDocRef,
                    { ...pendingSafe, transactionHash: pendingSafe.satoshiData.transactionHash },
                    { merge: true },
                );
            } catch (error) {
                console.error(`Failed to merge data for ID ${pendingSafe.id}:`, error);
                throw error;
            }
        });
    } catch (error) {
        console.error("Error updating pending safes:", error);
        throw error;
    }

    // Optional: You might want to save the updatedPendingSafes back to the database or perform additional actions here
};

export default updatePendingSafes;
