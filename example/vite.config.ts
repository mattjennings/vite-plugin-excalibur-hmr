import { defineConfig } from "vite"
import plugin from "vite-plugin-excalibur-hmr/plugin"

export default defineConfig({
  optimizeDeps: {
    exclude: ["excalibur", "vite-plugin-excalibur-hmr"],
  },
  plugins: [plugin()],
})
