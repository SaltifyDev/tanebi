import z from 'zod';

export const zAppInfo = z.object({
  Os: z.string(),
  Kernel: z.string(),
  VendorOs: z.string(),
  CurrentVersion: z.string(),
  MiscBitmap: z.number(),
  PtVersion: z.string(),
  SsoVersion: z.number(),
  PackageName: z.string(),
  WtLoginSdk: z.string(),
  AppId: z.number(),
  SubAppId: z.number(),
  AppClientVersion: z.number(),
  MainSigMap: z.number(),
  SubSigMap: z.number(),
  NTLoginType: z.number(),
});

export type AppInfo = z.infer<typeof zAppInfo>;

export const BundledAppInfo = {
  Linux: {
    '39038': (await import('./linux/39038.json')) satisfies AppInfo,
    '46494': (await import('./linux/46494.json')) satisfies AppInfo,
  },
};
