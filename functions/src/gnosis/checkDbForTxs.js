const { isEqual } = require("underscore");
const { db } = require("../firebase");

const checkDbForTxs = async (transactions, teamid) => {
    try {
        let txModified = false;
        const txsRef = db.collection(`teams/${teamid}/transactions`);

        for (const transaction of transactions) {
            // Query to find the specific transaction
            const queryField = transaction.safeTxHash ? "safeTxHash" : "txHash";
            const queryValue = transaction.safeTxHash || transaction.txHash;
            const querySnapshot = await txsRef.where(queryField, "==", queryValue).get();

            if (!querySnapshot.empty) {
                // Transaction found in the database
                const txInDb = querySnapshot.docs[0].data();
                if (isTransactionUpdated(txInDb, transaction)) {
                    // Merge new data and update the database
                    await txsRef.doc(querySnapshot.docs[0].id).set(transaction, { merge: true });
                    txModified = true;
                }
            } else {
                // If the transaction does not exist in the database, add it
                await txsRef.add(transaction);
                txModified = true;
            }
        }
        return txModified;
    } catch (error) {
        console.error(error);
    }
};

const isTransactionUpdated = (txInDb, newTx) => {
    // Check if newTx has any field that is different from txInDb
    for (const key in newTx) {
        if (!(key in txInDb) || !isEqual(newTx[key], txInDb[key])) {
            return true; // New or updated field in newTx
        }
    }

    // Check if newTx lacks any field that exists in txInDb
    for (const key in txInDb) {
        if (!(key in newTx)) {
            return true; // Missing field in newTx
        }
    }

    return false; // No new or updated fields in newTx
};

module.exports = {
    checkDbForTxs,
};
