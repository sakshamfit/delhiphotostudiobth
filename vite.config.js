import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  server: { allowedHosts: true },
  preview: { allowedHosts: true },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        owner: fileURLToPath(new URL('./owner.html', import.meta.url)),
      },
    },
  },
});
