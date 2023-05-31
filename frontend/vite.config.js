import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(() => {
    process.env.BROWSER = "google chrome";
    // supported browsers = ["firefox", "google chrome", "safari"]

    return {
        plugins: [react()],
        server: {
            // auto-open on yarn start
            open: true,
        },
        // fix for build warning: "Some chunks are larger than 500 kBs after minification"
        // not sure we need it yet, this increases build assets count from 3 to ~30
        // build: {
        //     rollupOptions: {
        //         output: {
        //             manualChunks(id) {
        //                 if (id.includes("node_modules")) {
        //                     return id
        //                         .toString()
        //                         .split("node_modules/")[1]
        //                         .split("/")[0]
        //                         .toString();
        //                 }
        //                 return null;
        //             },
        //         },
        //     },
        // },
    };
});
