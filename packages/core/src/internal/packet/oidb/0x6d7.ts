import { OidbBase } from '@/internal/packet/oidb';
import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

const OidbSvcTrpcTcp0x6D7_0 = ProtoMessage.of({
    create: ProtoField(1, () => ({
        groupUin: ProtoField(1, ScalarType.UINT32),
        rootDirectory: ProtoField(2, ScalarType.STRING),
        folderName: ProtoField(3, ScalarType.STRING),
    }), true, false),
});

const OidbSvcTrpcTcp0x6D7_1 = ProtoMessage.of({
    delete: ProtoField(1, () => ({
        groupUin: ProtoField(1, ScalarType.UINT32),
        folderId: ProtoField(2, ScalarType.STRING),
    }), true, false),
});

const OidbSvcTrpcTcp0x6D7_2 = ProtoMessage.of({
    rename: ProtoField(1, () => ({
        groupUin: ProtoField(1, ScalarType.UINT32),
        folderId: ProtoField(2, ScalarType.STRING),
        newFolderName: ProtoField(3, ScalarType.STRING),
    }), true, false),
});

const OidbSvcTrpcTcp0x6D7Response = ProtoMessage.of({
    create: ProtoField(1, () => ({
        retcode: ProtoField(1, ScalarType.INT32),
        retMsg: ProtoField(2, ScalarType.STRING, true, false),
        clientWording: ProtoField(3, ScalarType.STRING, true, false),
        folderInfo: ProtoField(4, () => ({
            folderId: ProtoField(1, ScalarType.STRING),
            folderPath: ProtoField(2, ScalarType.STRING),
            folderName: ProtoField(3, ScalarType.STRING),
            timestamp4: ProtoField(4, ScalarType.UINT32),
            timestamp5: ProtoField(5, ScalarType.UINT32),
            operatorUin6: ProtoField(6, ScalarType.UINT32),
            operatorUin9: ProtoField(7, ScalarType.UINT32),
        }), true, false),
    }), true, false),
    delete: ProtoField(2, () => ({
        retcode: ProtoField(1, ScalarType.INT32),
        retMsg: ProtoField(2, ScalarType.STRING, true, false),
    }), true, false),
    rename: ProtoField(3, () => ({
        retcode: ProtoField(1, ScalarType.INT32),
        retMsg: ProtoField(2, ScalarType.STRING, true, false),
    }), true, false),
});

export const GroupFS6D7 = {
    encodeCreateFolder(groupUin: number, name: string) {
        return OidbBase.encode({
            command: 0x6d7,
            subCommand: 0,
            body: OidbSvcTrpcTcp0x6D7_0.encode({
                create: { groupUin, rootDirectory: '/', folderName: name },
            }),
            properties: [],
        });
    },
    decodeCreateFolder(payload: Buffer) {
        const body = OidbSvcTrpcTcp0x6D7Response.decode(OidbBase.decode(payload).body!);
        return { code: body.create?.retcode ?? -1, message: body.create?.retMsg };
    },
    encodeDeleteFolder(groupUin: number, folderId: string) {
        return OidbBase.encode({
            command: 0x6d7,
            subCommand: 1,
            body: OidbSvcTrpcTcp0x6D7_1.encode({ delete: { groupUin, folderId } }),
            properties: [],
        });
    },
    decodeDeleteFolder(payload: Buffer) {
        const body = OidbSvcTrpcTcp0x6D7Response.decode(OidbBase.decode(payload).body!);
        return { code: body.delete?.retcode ?? -1, message: body.delete?.retMsg };
    },
    encodeRenameFolder(groupUin: number, folderId: string, newFolderName: string) {
        return OidbBase.encode({
            command: 0x6d7,
            subCommand: 2,
            body: OidbSvcTrpcTcp0x6D7_2.encode({ rename: { groupUin, folderId, newFolderName } }),
            properties: [],
        });
    },
    decodeRenameFolder(payload: Buffer) {
        const body = OidbSvcTrpcTcp0x6D7Response.decode(OidbBase.decode(payload).body!);
        return { code: body.rename?.retcode ?? -1, message: body.rename?.retMsg };
    },
};


