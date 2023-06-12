const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

// Creates a new client
const client = new SecretManagerServiceClient();

// Function to create a new secret or a new version of an existing secret
const createOrUpdatePrivateKey = async function(secretId, privateKey) {
    const parent = `projects/${JSON.parse(process.env.FIREBASE_CONFIG).projectId}`;

    // Check if the secret already exists
    try {
        await client.getSecret({ name: `${parent}/secrets/${secretId}` });
    } catch (e) {
        // If the secret doesn't exist, create a new one
        if (e.code === 5) {
            await client.createSecret({
                parent,
                secretId,
                secret: {
                    replication: {
                        automatic: {},
                    },
                },
            });
        } else {
            throw e;
        }
    }

    // Add a new version to the secret
    const [version] = await client.addSecretVersion({
        parent: `${parent}/secrets/${secretId}`,
        payload: {
            data: Buffer.from(privateKey, "utf8"),
        },
    });

    return {
        name: version.name,
    };
};

const getPrivateKey = async function(location) {
    const [version] = await client.accessSecretVersion({ name: location });
    const payload = version.payload.data.toString("utf8");
    return payload;
};

const deleteSecret = async function(secretName) {
    await client.deleteSecret({ name: secretName });
};

// Function to access a specific version of a secret
const getPrivateKeyVersion = async function(secretName, versionId) {
    const [version] = await client.accessSecretVersion({ name: `${secretName}/versions/${versionId}` });
    const payload = version.payload.data.toString("utf8");
    return payload;
};

// Function to delete a specific version of a secret
const deletePrivateKeyVersion = async function(secretName, versionId) {
    const test = await client.destroySecretVersion({ name: `${secretName}/versions/${versionId}` });
    console.log(test);
};

module.exports = {
    createOrUpdatePrivateKey,
    getPrivateKey,
    deleteSecret,
    deletePrivateKeyVersion,
    getPrivateKeyVersion,
};
