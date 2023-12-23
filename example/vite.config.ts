import { defineConfig } from "vite"
import hmr from "vite-plugin-excalibur-hmr"

export default defineConfig({
  optimizeDeps: {
    exclude: ["excalibur", "vite-plugin-excalibur-hmr"],
  },
  plugins: [hmr()],
})
