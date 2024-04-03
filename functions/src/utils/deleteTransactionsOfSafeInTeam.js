const { db, log, error } = require("../firebase");

const deleteTransactionsOfSafeInTeam = async (teamid, safe) => {
    const txsRef = db.collection(`teams/${teamid}/transactions`);

    try {
        // Query for transactions that have the specified safe
        const querySnapshot = await txsRef.where("safe", "==", safe).get();

        if (querySnapshot.empty) {
            log(`No transactions found for safe ${safe} in team ${teamid}`);
            return;
        }

        const deletePromises = [];
        querySnapshot.forEach((doc) => {
            deletePromises.push(doc.ref.delete());
        });

        await Promise.all(deletePromises);
        log(`Deleted all transactions for safe ${safe} in team ${teamid}`);
    } catch (err) {
        error(`Error deleting transactions for safe: ${safe} in team ${teamid}`, err);
        // throw error;
    }
};

module.exports = { deleteTransactionsOfSafeInTeam };
