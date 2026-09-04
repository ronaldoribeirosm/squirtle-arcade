import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base "./" => funciona tanto em hospedagem raiz quanto em subpasta (GitHub Pages).
export default defineConfig({
  plugins: [react()],
  base: "./",
});
