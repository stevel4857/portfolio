import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'js',
    emptyOutDir: false,
    codeSplitting: false,
    rollupOptions: {
      input: resolve(__dirname, 'src/motion/main.tsx'),
      output: {
        entryFileNames: 'motion-bundle.js',
      },
    },
  },
});