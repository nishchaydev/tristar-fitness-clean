import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/tristar-fitness-clean/' : '/',
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 3000, // Frontend port
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:6868',
        changeOrigin: true,
        secure: false,
      },
      '/health': {
        target: 'http://localhost:6868',
        changeOrigin: true,
        secure: false,
      }
    }
  },
}));