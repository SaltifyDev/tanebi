import { GetImplInfoOutput } from '@saltify/milky-types';
import { AppInfo } from 'tanebi';

export function transformProtocolOsType(os: AppInfo['Os']): GetImplInfoOutput['qq_protocol_type'] {
    if (os === 'Windows') {
        return 'windows';
    } else if (os === 'Linux') {
        return 'linux';
    } else if (os === 'Mac') {
        return 'macos';
    }
    return 'linux';
}