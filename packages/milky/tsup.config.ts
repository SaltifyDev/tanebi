import { defineConfig } from 'tsup';

import { execSync } from 'child_process';

function getCommitHash() {
    try {
        return execSync('git rev-parse HEAD').toString().trim();
    } catch (e) {
        console.error('unable to get commit hash：', e.message);
        return undefined;
    }
}

const COMMIT_HASH = getCommitHash() ?? 'debug';
console.log(`Using commit hash: ${COMMIT_HASH}`);

export default defineConfig({
    entry: ['src/index.ts'],
    format: 'cjs',
    target: 'node20',
    env: {
        COMMIT_HASH,
        BUILD_DATE: new Date().toISOString(),
    },
});
