import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: true,
    },
    optimizeDeps: {
        include: ['@babylonjs/materials'],
    },
});
