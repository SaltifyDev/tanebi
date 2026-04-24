import { type Bot, OidbError, type SsoPacketOverrides } from '..';
import { OidbBase } from '../internal/packet/oidb/base';

export interface Service<T extends Array<unknown>, R> {
  command: string;
  build(bot: Bot, ...args: T): Buffer;
  parse?(bot: Bot, payload: Buffer): R;
  overrides?: Partial<SsoPacketOverrides>;
}

export function defineService<T extends Array<unknown>, R = undefined>(service: Service<T, R>) {
  return service;
}

export interface OidbServiceInit<T extends Array<unknown>, R> {
  command: number;
  service: number;
  build(bot: Bot, ...args: T): Buffer;
  parse?(bot: Bot, payload: Buffer): R;
  reserved?: number;
  overrides?: Partial<SsoPacketOverrides>;
}

export function defineOidbService<T extends Array<unknown>, R = undefined>(init: OidbServiceInit<T, R>): Service<T, R> {
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
