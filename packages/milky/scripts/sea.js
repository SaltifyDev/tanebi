import { exec } from '@yao-pkg/pkg';
import process from 'node:process';

const jsEntryName = 'dist/index.cjs';
const ext = process.platform === 'win32' ? '.exe' : '';

exec([
    jsEntryName,
    '-t', 'host',
    '-o', `sea/tanebi-milky${ext}`,
]);
