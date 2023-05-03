// The Cloud Functions for Firebase SDK to create Cloud Functions and set up triggers.
const functions = require("firebase-functions");
const twilio = require("twilio");
const admin = require("firebase-admin");
const stripe = require("stripe")(
    "sk_test_51MYz08DRit5IskyXRtiL3nLfrodeoH8Ryf9qJ5TgNHVUuUW4vhHvlzgfnDidwCYJmd6f27wcmxC0GoLhsQDyS4DD00lGQU89R3"
); // this is a test mode api Stripe key
const { write } = require("firebase-functions/logger");
const appUrl =
    "https://us-central1-text-chatgpt.cloudfunctions.net/receivedText";
require("dotenv").config();
const twilioClient = new twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);
const { openAIResponse } = require("./openAI");

admin.initializeApp();

// Take the text parameter passed to this HTTP endpoint and insert it into
// Firestore under the path /messages/:documentId/original
exports.receivedText = functions.https.onRequest(async (req, res) => {
    if (
        !(
            req.body.AccountSid === process.env.TWILIO_ACCOUNT_SID &&
            req.get("X-Twilio-Signature").length > 0
        )
    ) {
        return;
    }
    const userPhone = req.body.From;
    const userDocRef = admin
        .firestore()
        .collection("userConvos")
        .doc(userPhone);
    const userDoc = await userDocRef.get();
    // If a user already has a conversation going
    if (userDoc.exists) {
        // log the message to the messageReceived docs
        const writeResult = await admin
            .firestore()
            .collection("messageReceived")
            .add({
                headers: req.headers,
                body: req.body,
                hostname: req.hostname,
                ip: req.ip,
                createdTime: Date.now(),
            });

        // setup variables
        const receivedMessage = req.body.Body;
        const docData = userDoc.data();
        const convo = docData.convoArray;

        // if UNSUBSCRIBE in the message
        if (receivedMessage.indexOf("UNSUBSCRIBE") >= 0) {
            const unSubscribeUser = await admin
                .firestore()
                .collection("userConvos")
                .doc(user.phoneNumber)
                .set(
                    {
                        subscribed: false,
                    },
                    { merge: true }
                );
            twilioClient.messages.create({
                body: "You have been successfully unsubscribed. If at any time you would like to come back, simply sign up at www.getprontoai.com again. Thanks!",
                to: userPhone,
                from: process.env.TWILIO_NUMBER,
            });
            return;
        }

        // if too many messages
        // if(convo.length > 100) {
        //     twilioClient.messages.create({
        //         body: 'You have run into our systems limiter. Thanks for using the product! We are rolling out a paid service shortly and we will let you know when its launched.',
        //         to: userPhone,
        //         from: process.env.TWILIO_NUMBER
        //     });
        //     twilioClient.messages.create({
        //         body: 'User: ' + userPhone + ' has hit the limit',
        //         to: '+14359620349',
        //         from: process.env.TWILIO_NUMBER
        //     });
        //     return;
        // }

        // add human message to convo
        convo.push("Human:" + receivedMessage);

        // get AI response
        const aiResponse = await openAIResponse(convo);

        // create the response object
        convo.push("AI:" + aiResponse);
        let messageToSend = {
            body: aiResponse,
            to: userPhone,
            from: process.env.TWILIO_NUMBER,
            dateCreated: Date.now(),
        };

        // text the user back
        try {
            twilioClient.messages.create(messageToSend);
        } catch (e) {
            console.log(e);
        }

        // log the message to the messageSent collection
        const logMessage = await admin
            .firestore()
            .collection("messageSent")
            .add({
                ...messageToSend,
            });

        // save the messages to the userConvo object
        await admin
            .firestore()
            .collection("userConvos")
            .doc(userPhone)
            .update(
                {
                    convoArray: convo,
                    receivedMessages: [
                        ...docData.receivedMessages,
                        writeResult.id,
                    ],
                    sentMessages: [...docData.sentMessages, logMessage.id],
                },
                { merge: true }
            );
    } else {
        // tell user to register on website
        const unregisteredMsg =
            "Hey there! It looks like you haven't registered on our site yet. Please head to https://getprontoai.com/ to register.";

        // text the user that they don't have an account
        try {
            twilioClient.messages.create({
                body: unregisteredMsg,
                to: userPhone,
                from: process.env.TWILIO_NUMBER,
            });
        } catch (e) {
            console.log(e);
        }
    }
    return;
});

// commenting out sendWelcomeText function for now as it will send sms to every user created, we are still in testing mode here
// exports.sendWelcomeText = functions.auth.user().onCreate(async (user) => {
//     const msg =
//         "Welcome to texting ProntoAI! ProntoAI is fantastic at answering questions, having a conversation, or basically anything that can be written (even playing chess)." +
//         " To get started simply text back! \n\nTo unsubscribe, text back STOP in all caps";
//     let messageToSend = {
//         body: msg,
//         to: user.phoneNumber,
//         from: process.env.TWILIO_NUMBER,
//     };
//     const message = await twilioClient.messages.create(messageToSend);
//     messageToSend.dateSent = Date.now();
//     const logMessage = await admin
//         .firestore()
//         .collection("messageSent")
//         .add({
//             ...messageToSend,
//         });
//     const userConvoDoc = {
//         welcomeMessageSent: msg,
//         convoArray: [],
//         sentMessages: [logMessage.id],
//         receivedMessages: [],
//         timeOfLastMessage: Date.now(),
//     };
//     const newDoc = await admin
//         .firestore()
//         .collection("userConvos")
//         .doc(user.phoneNumber)
//         .set({ ...userConvoDoc });
// });

const corsAndOptions = (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
        res.status(204).send("");
    }
};

// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = async (req, res) => {
    functions.logger.log(
        "Check if request is authorized with Firebase ID token"
    );
    if (
        (!req.headers.authorization ||
            !req.headers.authorization.startsWith("Bearer ")) &&
        !(req.cookies && req.cookies.__session)
    ) {
        functions.logger.error(
            "No Firebase ID token was passed as a Bearer token in the Authorization header.",
            "Make sure you authorize your request by providing the following HTTP header:",
            "Authorization: Bearer <Firebase ID Token>",
            'or by passing a "__session" cookie.'
        );
        res.status(403).send({ message: "Unauthorized" });
        return;
    }
    let idToken;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer ")
    ) {
        functions.logger.log('Found "Authorization" header');
        // Read the ID Token from the Authorization header.
        idToken = req.headers.authorization.split("Bearer ")[1];
    } else if (req.cookies) {
        functions.logger.log('Found "__session" cookie');
        // Read the ID Token from cookie.
        idToken = req.cookies.__session;
    } else {
        // No cookie
        res.status(403).send({ message: "Unauthorized" });
        return;
    }
    try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        functions.logger.log("ID Token correctly decoded", decodedIdToken);
        req.user = decodedIdToken;
        return true;
    } catch (error) {
        functions.logger.error(
            "Error while verifying Firebase ID token:",
            error
        );
        res.status(403).send({ message: "Unauthorized" });
        return;
    }
};

exports.stripeCustomers = functions.https.onRequest(async (req, res) => {
    corsAndOptions(req, res);
    if (validateFirebaseIdToken(req, res)) {
        if (req.method === "POST") {
            if (req.body.email) {
                try {
                    const customer = await stripe.customers.create({
                        email: req.body.email,
                        tax_exempt: "exempt",
                    });
                    // Save the customer.id in your database alongside your user.
                    await admin
                        .firestore()
                        .collection("stripeCustomers")
                        .doc(req.body.email)
                        .set({ ...customer }); // note: set.({}) will overwrite any existing data
                    // We're simulating authentication with a cookie.; ILIA - Do we need it?
                    res.cookie("customer", customer.id, {
                        maxAge: 900000,
                        httpOnly: true,
                    });
                    res.send(customer.data);
                } catch (e) {
                    res.status(400).send({ message: e.message });
                }
            } else res.status(400).send({ message: "Missing email value." });
        }
        if (req.method === "GET") {
            if (req.path === "/") {
                try {
                    const customers = await stripe.customers.list({
                        expand: ["data.subscriptions"],
                    });
                    res.send(customers.data);
                } catch (e) {
                    res.status(400).send({ message: e.message });
                }
            } else {
                try {
                    const customer = await stripe.customers.list({
                        email: req.path.slice(1),
                        expand: ["data.subscriptions"],
                    });
                    res.send(customer.data);
                } catch (e) {
                    res.status(400).send({ message: e.message });
                }
            }
        }
    }
});

exports.stripePrices = functions.https.onRequest(async (req, res) => {
    // const allowedOrigins = ["http://localhost:8000"];
    // const origin = req.headers.origin;
    // if (allowedOrigins.includes(origin)) {
    //     res.setHeader("Access-Control-Allow-Origin", origin);
    // }
    corsAndOptions(req, res);
    if (validateFirebaseIdToken(req, res)) {
        if (req.method === "GET") {
            if (req.path === "/") {
                try {
                    const prices = await stripe.prices.list({
                        expand: ["data.product"],
                    });
                    res.send(prices.data);
                } catch (e) {
                    res.status(400).send({ message: e.message });
                }
            } else {
                try {
                    const price = await stripe.prices.list({
                        product: req.path.slice(1),
                        expand: ["data.product"],
                    });
                    res.send(price.data);
                } catch (e) {
                    res.status(400).send({ message: e.message });
                }
            }
        }
    }
});

// exports.stripeSubscriptions = functions.https.onRequest(async (req, res) => {
//     corsAndOptions(req, res);
//     if (req.method === "POST") {
//         if (req.body.customerID) {
//             try {
//                 const subscription = await stripe.subscriptions.create({
//                     customer: req.body.customerID,
//                     items: [{ price: "price_1MeW1vDRit5IskyXt0rpa7MP" }],
//                     payment_behavior: "default_incomplete",
//                     expand: ["latest_invoice.payment_intent"],
//                 });

//                 // // Save the customer.id in your database alongside your user.
//                 // await admin
//                 //     .firestore()
//                 //     .collection("stripeCustomers")
//                 //     .doc(req.body.email)
//                 //     .update({ ...customer });
//                 // // We're simulating authentication with a cookie. Do we need it?
//                 // res.cookie("customer", customer.id, {
//                 //     maxAge: 900000,
//                 //     httpOnly: true,
//                 // });
//                 res.send({
//                     subscriptionId: subscription.id,
//                     clientSecret:
//                         subscription.latest_invoice.payment_intent
//                             .client_secret,
//                 });
//             } catch (e) {
//                 return res.status(400).send({ message: e.message });
//             }
//         } else res.status(400).send({ message: "Missing customerID value." });
//     }
// });

// exports.stripePaymentIntents = functions.https.onRequest(async (req, res) => {
//     corsAndOptions(req, res);
//     if (req.method === "POST") {
//         const calculateOrderAmount = (items) => {
//             // Replace this constant with a calculation of the order's amount
//             // Calculate the order total on the server to prevent
//             // people from directly manipulating the amount on the client
//             return 299;
//         };
//         // Create a PaymentIntent with the order amount and currency
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount: calculateOrderAmount(),
//             currency: "usd",
//             automatic_payment_methods: {
//                 enabled: true,
//             },
//         });
//         res.send({
//             clientSecret: paymentIntent.client_secret,
//         });
//     }
//     if (req.method !== "POST") {
//         res.status(400).send("Please send a POST request for payment intents.");
//         return;
//     }
// });
