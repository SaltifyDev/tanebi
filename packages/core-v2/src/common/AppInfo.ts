/**
 * 登录 QQ 所需的 App 信息。
 */
export interface AppInfo {
    // 'Windows' | 'Linux' | 'Mac'
    Os: string;

    // 'Windows_NT' | 'Linux' | 'Darwin'
    Kernel: string;

    // 'win32' | 'linux' | 'mac'
    VendorOs: string;

    // `${major}.${minor}.${patch}-${appClientVersion}`
    CurrentVersion: string;

    // 32764
    MiscBitmap: number;

    // '2.0.0'
    PtVersion: string;

    // 19
    SsoVersion: number;

    // 'com.tencent.qq'
    PackageName: string;

    // 'nt.wtlogin.0.0.1'
    WtLoginSdk: string;

    // win: 1600001604;
    // linux: 1600001612;
    // mac: 1600001615
    AppId: number;

    SubAppId: number;

    AppIdQrCode: number;

    AppClientVersion: number;

    // 169742560
    MainSigMap: number;

    // 0
    SubSigMap: number;

    // win & mac: 5; linux: 1
    NTLoginType: number;
}

/**
 * Linux 协议的 AppInfo 预设。
 */
export const LinuxAppInfoPreset: AppInfo = {
    'Os': 'Linux',
    'VendorOs': 'linux',
    'Kernel': 'Linux',
    'CurrentVersion': '3.2.15-30366',
    'MiscBitmap': 32764,
    'PtVersion': '2.0.0',
    'SsoVersion': 19,
    'PackageName': 'com.tencent.qq',
    'WtLoginSdk': 'nt.wtlogin.0.0.1',
    'AppId': 1600001615,
    'SubAppId': 537258424,
    'AppIdQrCode': 13697054,
    'AppClientVersion': 30366,
    'MainSigMap': 169742560,
    'SubSigMap': 0,
    'NTLoginType': 1,
};

/**
 * 从签名 URL 中获取 {@link AppInfo}。
 * @param signUrl 签名 URL
 * @returns AppInfo 对象
 */
export async function fetchAppInfoFromSignUrl(signUrl: string): Promise<AppInfo> {
    return await (fetch(signUrl.endsWith('/') ? `${signUrl}appinfo` : `${signUrl}/appinfo`)
        .then(res => res.json())) as AppInfo;
}