const { db } = require("./firebase");

const stateMachine = {
    DEFAULT_QANDA: async (user) => {
        // Logic for DEFAULT_QANDA state
    },

    ADDRESS_GOALS: async (user) => {
        // Logic for ADDRESS_GOALS state
    },

    INSPIRE: async (user) => {
        // Logic for INSPIRE state
    },

    HELP: async (user) => {
        // Logic for HELP state
    },
};

async function startStateMachineForUser(userId) {
    // Fetch user data from Firestore
    const userDoc = await db.collection("users").doc(userId).get();
    const user = userDoc.data();

    // If the user does not exist or has no state, default to DEFAULT_QANDA
    if (!user || !user.state) {
        user.state = "DEFAULT_QANDA";
    }

    // Call the state function
    if (stateMachine[user.state]) {
        await stateMachine[user.state](user);
    } else {
        console.error(`Invalid state "${user.state}" for user ${userId}`);
    }
}

module.exports = {
    startStateMachineForUser,
    stateMachine,
};
