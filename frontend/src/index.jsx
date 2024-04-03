import * as Sentry from "@sentry/react";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

Sentry.init({
    dsn: "https://8cd42e7a5d1c83472371ac44b18ae973@o4507022754381824.ingest.us.sentry.io/4507022758051840",
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    tracePropagationTargets: ["https://playground.satoshisafe.ai", "https://app.getsatoshisafe.com"],
});

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(<App />);
