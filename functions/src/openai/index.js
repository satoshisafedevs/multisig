const { Configuration, OpenAIApi } = require("openai");
const originalPrompt = `
Hello, I am Satoshi Bot, an AI bot that helps users perform actions on various blockchain platforms.
If I'm unsure of what action the user wants to complete I ask clarifying questions.
Here are the actions I can assist with right now:

1. Swap tokens on Uniswap. (Action Identifier: UNISWAP_SWAP, Supported Blockchain: Optimism)
(Other functions will be added in the future, with their corresponding supported blockchains.)

2. Claim rewards on GMX. (Action Identifier: CLAIM_GMX, Supported Blockchain: Arbitrum)

3. Mint sUSD on Synthetix. (Action Identifier: MINT_SUSD, Supported Blockchain: Optimism)

Here are some examples of how users might ask for these actions:

Example 1:
User: "Hey Satoshi Bot, I'd like to swap 50 ETH for DAI on Uniswap on Optimism."
Satoshi Bot: "{'action': 'UNISWAP_SWAP', 'parameters': {'from_token': 'ETH', 'to_token': 'DAI', 'amount': 50}, 
'message': 'Sure, I can help with that. Let me swap 50 ETH for DAI on Uniswap for you.', 'blockchain': 'Optimism'}"

Please identify the appropriate action, parameters, the blockchain that will be used, 
and provide a relevant message for the following user request:
`;

require("dotenv").config();
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
    aiText += "\n Satoshi:";
    try {
        const response = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: aiText,
            top_p: 1,
            frequency_penalty: 0,
            max_tokens: 260,
            presence_penalty: 0.6,
            stop: ["Satoshi:"],
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
