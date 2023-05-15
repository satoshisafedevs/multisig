const functions = require("firebase-functions");
const { auth, onRequest, db } = require("../firebase");
const stripe = require("stripe")(
    "sk_test_51MYz08DRit5IskyXRtiL3nLfrodeoH8Ryf9qJ5TgNHVUuUW4vhHvlzgfnDidwCYJmd6f27wcmxC0GoLhsQDyS4DD00lGQU89R3",
);
// Express middleware that validates Firebase ID Tokens passed in the Authorization HTTP header.
// The Firebase ID token needs to be passed as a Bearer token in the Authorization HTTP header like this:
// `Authorization: Bearer <Firebase ID Token>`.
// when decoded successfully, the ID Token content will be added as `req.user`.
const validateFirebaseIdToken = async (req, res) => {
    functions.logger.log(
        "Check if request is authorized with Firebase ID token",
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
            'or by passing a "__session" cookie.',
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
        const decodedIdToken = await auth.verifyIdToken(idToken);
        functions.logger.log("ID Token correctly decoded", decodedIdToken);
        req.user = decodedIdToken;
        return true;
    } catch (error) {
        functions.logger.error(
            "Error while verifying Firebase ID token:",
            error,
        );
        res.status(403).send({ message: "Unauthorized" });
        return;
    }
};

const corsAndOptions = (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") {
        res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
        res.status(204).send("");
    }
};

exports.customers = onRequest(async (req, res) => {
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
                    await db
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
        res.end();
    }
});

exports.prices = onRequest(async (req, res) => {
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
        res.end();
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
