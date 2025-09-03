import { OidbBase } from '@/internal/packet/oidb';
import { InferProtoModelInput, ProtoMessage, ProtoModel } from '@/internal/util/pb';

export class OidbSvcContract<const T extends ProtoModel> {
    private readonly bodyProto: ProtoMessage<T>;
    
    constructor(
        public readonly command: number,
        public readonly subCommand: number,
        bodyFields: T,
        public readonly useReserved: boolean = false,
    ) {
        this.bodyProto = ProtoMessage.of(bodyFields);
    }

    encode(data: InferProtoModelInput<T>): Buffer {
        return OidbBase.encode({
            command: this.command,
            subCommand: this.subCommand,
            body: this.bodyProto.encode(data),
            properties: [],
            reserved: this.useReserved ? 1 : 0,
        });
    }

    tryDecode(data: Buffer) {
        const decoded = OidbBase.decode(data);
        return {
            ...decoded,
            body: decoded.body ? this.bodyProto.decode(decoded.body) : undefined,
        };
    }

    decodeBodyOrThrow(data: Buffer) {
        const decoded = this.tryDecode(data);
        if (decoded.errorCode !== 0 || !decoded.body) {
            throw new Error(
                `发生 oidb 错误 (0x${this.command.toString(16)}_${this.subCommand}, errorCode=${decoded.errorCode}): ${decoded.errorMsg}`
            );
        }
        return decoded.body;
    }
}