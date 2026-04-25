import { ProtoField, ProtoMessage } from '@saltify/typeproto';

import { type Bot, OidbError, type PacketClient, type SsoPacketOverrides } from '..';

export interface Service<T extends Array<unknown>, R, C extends PacketClient> {
  command: string;
  build(bot: Bot<C>, ...args: T): Buffer;
  parse?(bot: Bot<C>, payload: Buffer): R;
  overrides?: Partial<SsoPacketOverrides>;
}

export function defineService<T extends Array<unknown>, R = undefined, C extends PacketClient = PacketClient>(
  service: Service<T, R, C>,
) {
  return service;
}

export interface OidbServiceInit<T extends Array<unknown>, R, C extends PacketClient> {
  command: number;
  service: number;
  build(bot: Bot<C>, ...args: T): Buffer;
  parse?(bot: Bot<C>, payload: Buffer): R;
  reserved?: number;
  overrides?: Partial<SsoPacketOverrides>;
}

const OidbBase = ProtoMessage.of({
  command: ProtoField(1, 'uint32'),
  service: ProtoField(2, 'uint32'),
  result: ProtoField(3, 'uint32'),
  body: ProtoField(4, 'bytes'),
  message: ProtoField(5, 'string'),
  reserved: ProtoField(12, 'int32'),
});

export function defineOidbService<T extends Array<unknown>, R = undefined, C extends PacketClient = PacketClient>(
  init: OidbServiceInit<T, R, C>,
): Service<T, R, C> {
  return {
    command: `OidbSvcTrpcTcp.0x${init.command.toString(16)}_${init.service}`,
    build(bot, ...args) {
      const body = init.build(bot, ...args);
      return OidbBase.encode({
        command: init.command,
        service: init.service,
        body,
        reserved: init.reserved ?? 0,
      });
    },
    parse(bot, payload) {
      const { result, body, message } = OidbBase.decode(payload);
      if (result !== 0) {
        throw new OidbError(init.command, init.service, result, message);
      }
      return init.parse?.(bot, body) ?? (undefined as R);
    },
    overrides: init.overrides,
  };
}
