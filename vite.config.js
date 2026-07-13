import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
    base: "/Life_Planning_website/",
    plugins: [react(), tailwindcss()],
});
