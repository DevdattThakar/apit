import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable CSS code splitting for better performance
    cssCodeSplit: true,
    // Enable JS code splitting
    rollupOptions: {
      output: {
        // Manual chunks to split vendor libraries
        manualChunks: {
          // Split React and its dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Split UI components (Radix UI)
          'vendor-ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-popover',
          ],
          // Split heavy libraries
          'vendor-charts': ['recharts'],
          'vendor-maps': ['leaflet'],
          'vendor-forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
        },
        // Add hash to filenames for cache busting
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
    // Use esbuild for minification (built-in, faster)
    minify: 'esbuild',
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Generate source maps for production debugging (set to false for max performance)
    sourcemap: false,
    // Chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Enable inline workers
    worker: {
      format: 'es',
    },
  },
  // Optimization settings
  optimizeDeps: {
    // Pre-bundle these dependencies for faster dev server startup
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
    ],
    // Exclude specific dependencies from optimization
    // Local files should never be pre-bundled (prevents stale export analysis)
    exclude: [],
    // Force re-optimization on every restart
    force: false,
  },
  // Preview server settings for production testing
  preview: {
    port: 4173,
    strictPort: true,
    // Enable gzip/brotli compression
    headers: {
      'Cache-Control': 'public, max-age=31536000',
    },
  },
}));
