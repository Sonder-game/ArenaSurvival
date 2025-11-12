
import { defineConfig } from 'vite';
import { resolve } from 'path';
import { builtinModules } from 'module';

export default defineConfig({
  build: {
    ssr: true,
    lib: {
      entry: resolve(__dirname, 'src/server.ts'),
      name: 'server',
      fileName: 'server',
      formats: ['es'],
    },
    outDir: 'dist',
    target: 'node22',
    rollupOptions: {
      external: [...builtinModules, 'ws'],
    },
  },
});
