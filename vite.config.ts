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
      input: {
        motion: resolve(__dirname, 'src/motion/main.tsx'),
        'scroll-fx': resolve(__dirname, 'src/scroll/main.ts'),
        'voice-scheduler': resolve(__dirname, 'src/voice-scheduler/main.ts'),
      },
      output: {
        entryFileNames: (chunk) =>
          chunk.name === 'motion' ? 'motion-bundle.js' : `${chunk.name}.js`,
      },
    },
  },
});