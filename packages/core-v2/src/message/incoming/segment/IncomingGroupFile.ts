import { GroupFileExtra } from '@/internal/packet/message/GroupFileExtra';
import { Tlv, TlvVariableField } from '@/internal/util/tlv';
import { MessageParsingContext } from '@/message/incoming/context';

const groupFilePbTlv = Tlv.plain([TlvVariableField('groupFilePb', 'bytes', 'uint16', false)]);

/**
 * 接收的群文件消息段
 * @category 接收消息段 (IncomingSegment)
 */
export class IncomingGroupFile {
    /** @hidden */
    constructor(
        /**
         * 文件 ID，可用于下载文件
         */
        readonly fileId: string,

        /**
         * 文件名
         */
        readonly fileName: string,

        /**
         * 文件大小（字节）
         */
        readonly fileSize: number
    ) {}

    toPreviewString() {
        return '[群文件]';
    }

    /** @hidden */
    static tryParse(context: MessageParsingContext): IncomingGroupFile | null {
        const elem = context.peek();
        if (elem.trans && elem.trans.elemType === 24 && elem.trans.elemValue) {
            context.consume();
            const tlv = groupFilePbTlv.decode(elem.trans.elemValue.subarray(1));
            const groupFileExtra = GroupFileExtra.decode(tlv.groupFilePb);
            return new IncomingGroupFile(
                groupFileExtra.inner.info.fileId,
                groupFileExtra.inner.info.fileName,
                groupFileExtra.inner.info.fileSize
            );
        }

        return null;
    }
}
