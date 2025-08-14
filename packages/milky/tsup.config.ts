import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/index.ts'],
    format: 'cjs',
    target: 'node20',
    env: {
        COMMIT_HASH: process.env.GITHUB_SHA ?? 'debug',
        BUILD_DATE: new Date().toISOString(),
    }
});