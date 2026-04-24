import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  format: 'esm',
  sourcemap: true,
  clean: true,
});
