import type { IncomingSsoPacket, OutgoingSsoPacket, PacketClient } from 'tanebi';

export interface PMHQClientOptions {
  url?: string;
  httpUrl?: string;
  timeout?: number;
}

export interface PMHQSelfInfo {
  uin: string;
  uid: string;
}

interface PMHQSendPayload {
  type: 'send';
  data: {
    echo?: string;
    cmd: string;
    pb: string;
  };
}

interface PMHQCallPayload<TArgs extends unknown[]> {
  type: 'call';
  data: {
    echo?: string;
    func: string;
    args: TArgs;
  };
}

interface PMHQRecvResponse {
  type: 'recv';
  data?: {
    echo?: string;
    cmd?: string;
    pb?: string;
  };
  code?: number;
  message?: string;
}

interface PMHQCallResponse<TResult> {
  type: 'call';
  data?: {
    echo?: string;
    result?: TResult;
  };
  code?: number;
  message?: string;
}

type PMHQResponse = PMHQRecvResponse | PMHQCallResponse<unknown>;

interface PendingRequest<TResult> {
  resolve: (value: TResult) => void;
  reject: (reason: Error) => void;
  timer: ReturnType<typeof setTimeout>;
}

const defaultUrl = 'ws://localhost:13000/ws';
const defaultHttpUrl = 'http://localhost:13000/';
const defaultTimeout = 10_000;

export class PMHQClient implements PacketClient {
  readonly url: string;

  readonly httpUrl: string;

  readonly timeout: number;

  private ws?: WebSocket;

  private connecting?: Promise<WebSocket>;

  private readonly pending = new Map<string, PendingRequest<PMHQResponse>>();

  private readonly pushHandlers = new Set<(packet: IncomingSsoPacket) => void>();

  constructor(options: PMHQClientOptions = {}) {
    this.url = options.url ?? defaultUrl;
    this.httpUrl = options.httpUrl ?? defaultHttpUrl;
    this.timeout = options.timeout ?? defaultTimeout;
  }

  async send(packet: OutgoingSsoPacket): Promise<IncomingSsoPacket> {
    const echo = String(packet.sequence);
    const response = await this.request<PMHQRecvResponse>(echo, {
      type: 'send',
      data: {
        echo,
        cmd: packet.command,
        pb: packet.payload.toString('hex'),
      },
    });

    return this.toIncomingPacket(packet, response);
  }

  onPush(handler: (packet: IncomingSsoPacket) => void): void {
    this.pushHandlers.add(handler);
  }

  offPush(handler: (packet: IncomingSsoPacket) => void): void {
    this.pushHandlers.delete(handler);
  }

  async sendHttp(packet: OutgoingSsoPacket): Promise<IncomingSsoPacket> {
    const response = await this.post<PMHQRecvResponse>({
      type: 'send',
      data: {
        cmd: packet.command,
        pb: packet.payload.toString('hex'),
      },
    });

    return this.toIncomingPacket(packet, response);
  }

  async call<TArgs extends unknown[], TResult>(func: string, args: TArgs): Promise<TResult> {
    const echo = crypto.randomUUID();
    const response = await this.request<PMHQCallResponse<TResult>>(echo, {
      type: 'call',
      data: {
        echo,
        func,
        args,
      },
    });

    if ((response.code ?? 0) !== 0) {
      throw new Error(response.message || `PMHQ call ${func} failed with code ${response.code}`);
    }

    return response.data?.result as TResult;
  }

  getSelfInfo(): Promise<PMHQSelfInfo> {
    return this.call<[], PMHQSelfInfo>('getSelfInfo', []);
  }

  close(): void {
    this.ws?.close();
    this.ws = undefined;
    this.connecting = undefined;
    this.rejectAllPending(new Error('PMHQ websocket closed'));
  }

  private async request<TResult extends PMHQResponse>(
    echo: string,
    payload: PMHQSendPayload | PMHQCallPayload<unknown[]>,
  ): Promise<TResult> {
    const ws = await this.connect();
    const response = new Promise<TResult>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(echo);
        reject(new Error(`PMHQ request timed out after ${this.timeout}ms`));
      }, this.timeout);

      this.pending.set(echo, {
        resolve: (value) => resolve(value as TResult),
        reject,
        timer,
      });
    });

    try {
      ws.send(JSON.stringify(payload));
    } catch (error) {
      const pending = this.pending.get(echo);
      if (pending) {
        clearTimeout(pending.timer);
        this.pending.delete(echo);
      }
      throw error;
    }

    return response;
  }

  private async connect(): Promise<WebSocket> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return this.ws;
    }

    if (this.connecting) {
      return this.connecting;
    }

    this.connecting = new Promise((resolve, reject) => {
      const ws = new WebSocket(this.url);

      const cleanup = () => {
        ws.removeEventListener('open', handleOpen);
        ws.removeEventListener('error', handleError);
      };

      const handleOpen = () => {
        cleanup();
        this.ws = ws;
        this.connecting = undefined;
        ws.addEventListener('message', (event) => this.handleMessage(event.data));
        ws.addEventListener('close', () => {
          if (this.ws === ws) {
            this.ws = undefined;
          }
          this.rejectAllPending(new Error('PMHQ websocket closed'));
        });
        ws.addEventListener('error', () => {
          this.rejectAllPending(new Error('PMHQ websocket error'));
        });
        resolve(ws);
      };

      const handleError = () => {
        cleanup();
        this.connecting = undefined;
        reject(new Error(`Failed to connect PMHQ websocket: ${this.url}`));
      };

      ws.addEventListener('open', handleOpen);
      ws.addEventListener('error', handleError);
    });

    return this.connecting;
  }

  private async post<TResult extends PMHQResponse>(
    payload: PMHQSendPayload | PMHQCallPayload<unknown[]>,
  ): Promise<TResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(this.httpUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`PMHQ HTTP request failed with status ${response.status}`);
      }

      return (await response.json()) as TResult;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`PMHQ HTTP request timed out after ${this.timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timer);
    }
  }

  private handleMessage(data: unknown): void {
    const response = this.parseResponse(data);
    if (!response) {
      return;
    }

    const echo = response.data?.echo;
    if (echo) {
      const pending = this.pending.get(echo);
      if (pending) {
        clearTimeout(pending.timer);
        this.pending.delete(echo);
        pending.resolve(response);
        return;
      }
    }

    if (response.type === 'recv') {
      this.emitPush(response);
    }
  }

  private parseResponse(data: unknown): PMHQResponse | undefined {
    try {
      const text = typeof data === 'string' ? data : Buffer.from(data as ArrayBuffer).toString('utf8');
      return JSON.parse(text) as PMHQResponse;
    } catch {
      return undefined;
    }
  }

  private emitPush(response: PMHQRecvResponse): void {
    const command = response.data?.cmd;
    if (!command) {
      return;
    }

    const packet: IncomingSsoPacket = {
      command,
      sequence: Number(response.data?.echo ?? 0),
      retcode: response.code ?? 0,
      payload: Buffer.from(response.data?.pb ?? '', 'hex'),
      extra: response.message ?? '',
    };

    this.pushHandlers.forEach((handler) => {
      handler(packet);
    });
  }

  private toIncomingPacket(packet: OutgoingSsoPacket, response: PMHQRecvResponse): IncomingSsoPacket {
    return {
      command: response.data?.cmd ?? packet.command,
      sequence: packet.sequence,
      retcode: response.code ?? 0,
      payload: Buffer.from(response.data?.pb ?? '', 'hex'),
      extra: response.message ?? '',
    };
  }

  private rejectAllPending(error: Error): void {
    this.pending.forEach((request) => {
      clearTimeout(request.timer);
      request.reject(error);
    });
    this.pending.clear();
  }
}
