import mitt from 'mitt';

import {
  type AppInfo,
  createLogger,
  type LogEmitter,
  type LogMessage,
  type PacketClient,
  type Service,
  ServiceError,
} from './common';
import { BotEntityHolder, BotFriend, type BotFriendData } from './entity';
import { FetchFriendData } from './internal/service/system';

import { randomInt } from 'node:crypto';

export class Bot {
  private packetSeq: number;

  private friendHolder;

  private readonly logBus: LogEmitter = mitt();
  private readonly logger = createLogger(this.logBus, this.constructor.name);

  constructor(
    readonly appinfo: AppInfo,
    readonly client: PacketClient,
  ) {
    this.packetSeq = randomInt(10000, 100000);

    this.friendHolder = new BotEntityHolder(
      this,
      async (bot) => {
        let nextUin: number | undefined;
        const mappedData = new Map<number, BotFriendData>();
        do {
          const { dataList, nextUin: next } = await bot.callService(FetchFriendData, nextUin);
          dataList.forEach((data) => {
            // TODO: update uin/uid cache
            mappedData.set(data.uin, data);
          });
          nextUin = next;
        } while (nextUin); // not 0 or undefined
        return mappedData;
      },
      (bot, data) => new BotFriend(bot, data),
    );
  }

  async getFriends(): Promise<BotFriend[]> {
    return Array.from(await this.friendHolder.getAll());
  }

  createLogger(module: string) {
    return createLogger(this.logBus, module);
  }

  onLog(handler: (logMessage: LogMessage) => void) {
    this.logBus.on('log', handler);
  }

  offLog(handler: (logMessage: LogMessage) => void) {
    this.logBus.off('log', handler);
  }

  /** @hidden */
  async callService<T extends Array<unknown>, R>(service: Service<T, R>, ...args: T): Promise<R> {
    const seq = this.packetSeq++;
    this.logger.debug(`Call ${service.command} with seq=${seq}`);
    const payload = service.build(this, ...args);
    const responsePacket = await this.client.send({
      command: service.command,
      sequence: seq,
      payload: payload,
      overrides: service.overrides,
    });
    if (responsePacket.retcode !== 0) {
      throw new ServiceError(service.command, responsePacket.retcode, responsePacket.extra);
    }
    if (service.parse) {
      return service.parse(this, responsePacket.payload);
    } else {
      return undefined as R;
    }
  }
}

export * from './common';
export * from './entity';
