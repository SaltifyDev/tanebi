export class ServiceError extends Error {
  constructor(
    public readonly command: string,
    public readonly retcode: number,
    public readonly message: string,
  ) {
    super(`ServiceError when calling ${command}, code=${retcode}, message=${message}`);
  }
}

export class OidbError extends Error {
  constructor(
    public readonly command: number,
    public readonly service: number,
    public readonly result: number,
    public readonly oidbMessage: string,
  ) {
    super(`OidbError when calling 0x${command.toString(16)}_${service}, code=${result}, message=${oidbMessage}`);
  }
}
