export interface PMHQClientOptions {
  url?: string;
  httpUrl?: string;
  timeout?: number;
}

export interface PMHQSelfInfo {
  uin: string;
  uid: string;
}

export interface PMHQSendPayload {
  type: 'send';
  data: {
    echo?: string;
    cmd: string;
    pb: string;
  };
}

export interface PMHQCallPayload<TArgs extends unknown[]> {
  type: 'call';
  data: {
    echo?: string;
    func: string;
    args: TArgs;
  };
}

export interface PMHQRecvResponse {
  type: 'recv';
  data?: {
    echo?: string;
    cmd?: string;
    pb?: string;
  };
  code?: number;
  message?: string;
}

export interface PMHQCallResponse<TResult> {
  type: 'call';
  data?: {
    echo?: string;
    result?: TResult;
  };
  code?: number;
  message?: string;
}

export type PMHQResponse = PMHQRecvResponse | PMHQCallResponse<unknown>;
