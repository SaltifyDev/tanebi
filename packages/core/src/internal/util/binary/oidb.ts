import { OidbBase } from '@/internal/packet/oidb';
import { InferProtoModelInput, ProtoMessage, ProtoModel } from '@tanebijs/protobuf';

export class OidbSvcContract<const T extends ProtoModel> {
    private readonly bodyProto: ProtoMessage<T>;
    
    constructor(
        public readonly command: number,
        public readonly subCommand: number,
        bodyFields: T,
    ) {
        this.bodyProto = ProtoMessage.of(bodyFields);
    }

    encode(data: InferProtoModelInput<T>): Buffer {
        return OidbBase.encode({
            command: this.command,
            subCommand: this.subCommand,
            body: this.bodyProto.encode(data),
            properties: [],
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
            throw new Error(`Failed to decode OidbSvcTrpcTcp0x${this.command.toString(16)}_${this.subCommand} response (${decoded.errorCode}): ${decoded.errorMsg}`);
        }
        return decoded.body;
    }
}