import { OidbSvcContract } from '@/internal/util/oidb';
import { ProtoField, ProtoMessage, ScalarType } from '@/internal/util/pb';

export const OidbSvcTrpcTcp0x6D7 = ProtoMessage.of({
    create: ProtoField(1, () => ({
        groupUin: ProtoField(1, ScalarType.UINT32),
        rootDirectory: ProtoField(2, ScalarType.STRING),
        folderName: ProtoField(3, ScalarType.STRING),
    }), true, false),
    delete: ProtoField(1, () => ({
        groupUin: ProtoField(1, ScalarType.UINT32),
        folderId: ProtoField(2, ScalarType.STRING),
    }), true, false),
    rename: ProtoField(1, () => ({
        groupUin: ProtoField(1, ScalarType.UINT32),
        folderId: ProtoField(2, ScalarType.STRING),
        newFolderName: ProtoField(3, ScalarType.STRING),
    }), true, false),
});

export const OidbSvcTrpcTcp0x6D7Response = ProtoMessage.of({
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

export const GroupFSCreateFolder = new OidbSvcContract(
    0x6d7, 0,
    OidbSvcTrpcTcp0x6D7.fields,
);

export const GroupFSCreateFolderResponse = new OidbSvcContract(
    0x6d7, 0,
    OidbSvcTrpcTcp0x6D7Response.fields,
);

export const GroupFSDeleteFolder = new OidbSvcContract(
    0x6d7, 1,
    OidbSvcTrpcTcp0x6D7.fields,
);

export const GroupFSDeleteFolderResponse = new OidbSvcContract(
    0x6d7, 1,
    OidbSvcTrpcTcp0x6D7Response.fields,
);

export const GroupFSRenameFolder = new OidbSvcContract(
    0x6d7, 2,
    OidbSvcTrpcTcp0x6D7.fields,
);

export const GroupFSRenameFolderResponse = new OidbSvcContract(
    0x6d7, 2,
    OidbSvcTrpcTcp0x6D7Response.fields,
);
