export interface OutgoingSsoPacket {
  command: string;
  sequence: number;
  payload: Buffer;
  overrides?: Partial<SsoPacketOverrides>;
}

export enum SsoRequestType {
  D2Auth = 12,
  Simple = 13,
}

export enum SsoEncryptType {
  None = 0,
  WithD2Key = 1,
  WithEmptyKey = 2,
}

export interface SsoPacketOverrides {
  requestType: SsoRequestType;
  encryptType: SsoEncryptType;
  ssoReservedMsgType: number;
}

export interface IncomingSsoPacket {
  command: string;
  sequence: number;
  retcode: number;
  payload: Buffer;
  extra: string;
}

export interface PacketClient {
  send(packet: OutgoingSsoPacket): Promise<IncomingSsoPacket>;
  onPush(handler: (packet: IncomingSsoPacket) => void): void;
}
