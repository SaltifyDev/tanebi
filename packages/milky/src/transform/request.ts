import { RequestState } from 'tanebi';

export function transformRequestState(state: RequestState): 'pending' | 'accepted' | 'rejected' | 'ignored' {
    if (state === RequestState.Pending)
        return 'pending';
    if (state === RequestState.Accepted)
        return 'accepted';
    if (state === RequestState.Rejected)
        return 'rejected';
    return 'ignored';
}