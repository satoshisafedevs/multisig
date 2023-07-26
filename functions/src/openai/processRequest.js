const processRequest = async (jsonString) => {
    try {
        const openAiResponse = JSON.parse(jsonString);
        return openAiResponse;
    } catch (error) {
        console.log(error);
    }
};

module.exports = {
    processRequest,
};
