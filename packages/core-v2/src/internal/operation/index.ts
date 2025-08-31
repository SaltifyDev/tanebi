import { BotContext } from '@/internal';

export type Operation<
    Args extends Array<unknown>,
    Ret = undefined,
> = {
    command: string;
    build: (ctx: BotContext, ...args: Args) => Buffer;
    parse: (ctx: BotContext, payload: Buffer) => Ret;
    postOnly: boolean;
};

export function defineOperation<Args extends unknown[] = [], Ret = undefined>(
    command: string,
    build: Operation<Args, Ret>['build'],
    parse: Operation<Args, Ret>['parse'],
): Operation<Args, Ret>;
export function defineOperation<Args extends unknown[] = []>(
    command: string,
    build: Operation<Args>['build'],
    parse?: Operation<Args>['parse'],
): Operation< Args>
export function defineOperation<Args extends unknown[] = [], Ret = undefined>(
    command: string,
    build: Operation<Args, Ret>['build'],
    parse?: Operation<Args, Ret>['parse'],
): Operation<Args, Ret> {
    if (parse) {
        return { command, build, parse, postOnly: false };
    } else {
        return { command, build, parse: () => undefined as Ret, postOnly: true };
    }
}