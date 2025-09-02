/**
 * 二维码扫描状态
 */
export enum BotQrCodeState {
    Confirmed = 0,
    CodeExpired = 17,
    WaitingForScan = 48,
    WaitingForConfirm = 53,
    Canceled = 54,
}
