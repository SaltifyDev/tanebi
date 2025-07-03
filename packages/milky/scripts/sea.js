import { exec } from '@yao-pkg/pkg';
import process from 'node:process';

const jsEntryName = 'dist/index.cjs';

if (process.arch === 'x64') {
    console.log('Building for Windows x64...');
    exec([
        jsEntryName,
        '-t', 'node20-win-x64',
        '-o', 'sea/tanebi-milky-win-x64.exe',
    ]);

    console.log('Building for Linux x64...');
    exec([
        jsEntryName,
        '-t', 'node20-linux-x64',
        '-o', 'sea/tanebi-milky-linux-x64',
    ]);
} else if (process.arch === 'arm64') {
    console.log('Building for macOS arm64...');
    exec([
        jsEntryName,
        '-t', 'node20-macos-arm64',
        '-o', 'sea/tanebi-milky-macos-arm64',
    ]);
}