import { MilkyApp } from '@/index';
import { download } from '@/common/download';
import { parseBuffer } from 'music-metadata';
import cp from 'node:child_process';
import { randomUUID } from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

export class NTSilkBinding {
    private constructor(readonly ntSilkPath: string, readonly ntSilkFilePath: string) {}

    async execute(inPath: string, outPath: string): Promise<void> {
        return new Promise((resolve, reject) => {
            cp.execFile(
                this.ntSilkFilePath,
                ['-i', inPath, outPath],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                },
            );
        });
    }

    static async create(ntSilkPath: string) {
        let ntSilkFileName: string | null = null;

        if (os.platform() === 'win32' && os.arch() === 'x64') {
            ntSilkFileName = 'ntsilk-win32-x64.exe';
        } else if (os.platform() === 'linux' && os.arch() === 'x64') {
            ntSilkFileName = 'ntsilk-linux-x64';
        }
        if (!ntSilkFileName) {
            throw new Error('NTSilk has not been compiled for this platform');
        }

        const ntSilkFilePath = path.join(ntSilkPath, ntSilkFileName);
        if (!fs.existsSync(ntSilkFilePath)) {
            console.info('First time of using NTSilk, downloading the binary...');
            const binary = await download(`https://ntsilk.ilharper.com/${ntSilkFileName}`);
            await fsp.writeFile(ntSilkFilePath, binary);
        }

        const silk = new NTSilkBinding(ntSilkPath, ntSilkFilePath);
        return silk;
    }
}

export async function convert(app: MilkyApp, record: Buffer) {
    const uuid = randomUUID();
    const audioMetadata = await parseBuffer(record, undefined, {
        duration: true,
        skipCovers: true,
    });
    const inputPath = path.join(app.userDataDir, `temp-${uuid}.${audioMetadata.format.container!}`);
    const outputPath = path.join(app.userDataDir, `temp-${uuid}.ntsilk`);
    await fsp.writeFile(inputPath, record);
    try {
        await app.ntSilkBinding!.execute(inputPath, outputPath);
        const silk = await fsp.readFile(outputPath);
        await fsp.unlink(outputPath);
        return { data: silk, meta: audioMetadata };
    } finally {
        await fsp.unlink(inputPath);
    }
}