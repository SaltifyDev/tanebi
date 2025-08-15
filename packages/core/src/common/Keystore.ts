export interface Keystore {
    uin: number;

    uid?: string;

    passwordMd5: string;

    stub: {
        /**
         * 16 bytes, generated on instance creation
         */
        randomKey: Buffer;

        /**
         * 16 bytes, initially 0
         */
        tgtgtKey: Buffer;
    };

    session: {
        /**
         * 16 bytes, initially 0
         */
        d2Key: Buffer;

        /**
         * Initially empty
         */
        d2: Buffer;

        /**
         * Initially empty
         */
        tgt: Buffer;


        sessionDate: Date;


        /**
         * 24 bytes
         */
        qrSign?: Buffer;

        qrString?: string;

        qrUrl?: string;


        exchangeKey?: Buffer;

        keySign?: Buffer;

        unusualSign?: Buffer;

        unusualCookies?: string;

        captchaUrl?: string;

        newDeviceVerifyUrl?: string;

        captcha?: [string, string, string];


        tempPassword?: Buffer;

        /**
         * 16 bytes, may be from Tlv19, for Tlv16A
         */
        noPicSig?: Buffer;

        sequence: number;
    };
}