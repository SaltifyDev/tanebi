import { ProtoField, ProtoMessage, ScalarType } from '@tanebijs/protobuf';

export enum GroupEssenceMessageChangeSetFlag {
    Add = 1,
    Remove = 2,
}

export const GroupEssenceMessageChange = ProtoMessage.of({
    groupUin: ProtoField(1, ScalarType.UINT32, false, false),
    msgSequence: ProtoField(2, ScalarType.UINT32, false, false),
    random: ProtoField(3, ScalarType.UINT32, false, false),
    setFlag: ProtoField(4, ScalarType.UINT32, false, false),
    memberUin: ProtoField(5, ScalarType.UINT32, false, false),
    operatorUin: ProtoField(6, ScalarType.UINT32, false, false),
});
