const { Configuration, OpenAIApi } = require("openai");
const originalPrompt =
    "The following is a conversation with an AI assistant. The assistant is helpful, creative, " +
    "clever, and very friendly.Human: Hello, who are you?AI: I am an AI created by OpenAI. How can I help you today?";

const configuration = new Configuration({
    apiKey: process.env.OPENAI_KEY,
});
const openai = new OpenAIApi(configuration);

const openAIResponse = async (convoArray) => {
    let aiText = originalPrompt;
    let aiResponse = "";
    const lastTenMsgs = convoArray.slice(-10);
    lastTenMsgs.forEach((message) => {
        aiText += message;
    });
    aiText += "AI:";
    console.log("this is the prompt sent to the user");
    console.log(aiText);
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: aiText,
            top_p: 1,
            frequency_penalty: 0,
            max_tokens: 260,
            presence_penalty: 0.6,
            stop: [" AI:"],
        });
        aiResponse = response.data.choices[0].text;
    } catch (e) {
        console.log(e);
    }
    return aiResponse;
};

module.exports = {
    openAIResponse,
};
