const { isEqual } = require("underscore");
const { db, error } = require("../firebase");
const { convertNestedArrays } = require("../gnosis/sanitizeTxs");

const checkDbForTxs = async (transactions, teamid) => {
    try {
        let txModified = false;
        const txsRef = db.collection(`teams/${teamid}/transactions`);

        for (const transaction of transactions) {
            // Query to find the specific transaction
            const queryField = transaction.safeTxHash ? "safeTxHash" : "txHash";
            const queryValue = transaction.safeTxHash || transaction.txHash;
            const querySnapshot = await txsRef.where(queryField, "==", queryValue).get();
            const sanitizedTx = convertNestedArrays(transaction);
            sanitizedTx.unifiedDate =
                sanitizedTx.executionDate || sanitizedTx.modified || sanitizedTx.submissionDate || null;
            // since firestore can not sort by 2 or more different fields - we need some commmon field

            if (!querySnapshot.empty) {
                // Transaction found in the database
                const txInDb = querySnapshot.docs[0].data();
                if (isTransactionUpdated(txInDb, sanitizedTx)) {
                    // Merge new data and update the database
                    await txsRef.doc(querySnapshot.docs[0].id).set(sanitizedTx, { merge: true });
                    txModified = true;
                }
            } else {
                // If the transaction does not exist in the database, add it
                await txsRef.add(sanitizedTx);
                txModified = true;
            }
        }
        return txModified;
    } catch (err) {
        error(err);
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
        if (key === "satoshiData") continue; // Skip the satoshiData field
        // this is a custom field we add to easy understand all transaction data
        if (!(key in newTx)) {
            return true; // Missing field in newTx
        }
    }

    return false; // No new or updated fields in newTx
};

module.exports = {
    checkDbForTxs,
};
