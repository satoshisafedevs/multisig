import { db, getDocs, collection, query, where, orderBy } from "../../firebase";

const getPendingSafes = async ({ currentTeam }) => {
    const transactionsRef = collection(db, "teams", currentTeam.id, "transactions");
    const pendingSafeTransactions = query(
        transactionsRef,
        where("safe", "==", "pending"), // Changed to filter directly for "pending"
        orderBy("submissionDate", "desc"),
    );

    // To actually retrieve the data, you'll need to use getDocs() from Firestore

    try {
        const querySnapshot = await getDocs(pendingSafeTransactions);
        const safeTransactions = querySnapshot.docs.map((fDoc) => ({ id: fDoc.id, ...fDoc.data() }));
        return safeTransactions;
    } catch (error) {
        console.error("Error getting pending safes:", error);
        throw error; // Or handle the error as appropriate for your application
    }
};

export default getPendingSafes;
