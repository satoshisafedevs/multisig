import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import eslint from "vite-plugin-eslint";

// https://vitejs.dev/config/
export default defineConfig(() => {
    process.env.BROWSER = "google chrome";
    // supported browsers = ["firefox", "google chrome", "safari"]

    return {
        plugins: [react(), eslint()],
        server: {
            // auto-open on yarn start
            open: true,
        },
    };
});
