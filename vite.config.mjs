import { defineConfig } from 'vite';

export default defineConfig({
  // The site is deployed at the Vercel domain root. Keeping this explicit
  // prevents nested-route asset URLs from pointing at the wrong directory.
  base: '/',
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.bin', '**/*.hdr', '**/*.ktx2'],
  build: {
    target: 'es2020',
    sourcemap: true,
  },
  server: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
