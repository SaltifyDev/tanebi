export type Class<InstanceType, StaticType> = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    new (...args: any[]): InstanceType;
    prototype: InstanceType;
} & StaticType;