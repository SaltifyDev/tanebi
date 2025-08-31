import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const GroupNameChange = ProtoMessage.of({
    name: ProtoField(2, ScalarType.STRING),
});