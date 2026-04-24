import type { Emitter } from 'mitt';

export interface LogMessage {
  level: 'trace' | 'debug' | 'info' | 'warn' | 'error';
  module: string;
  message: string;
  error?: unknown;
}

export type LogEmitter = Emitter<{
  log: LogMessage;
}>;

export interface Logger {
  trace(message: string, error?: unknown): void;
  debug(message: string, error?: unknown): void;
  info(message: string, error?: unknown): void;
  warn(message: string, error?: unknown): void;
  error(message: string, error?: unknown): void;
}

export function createLogger(logEmitter: LogEmitter, module: string): Logger {
  return {
    trace(message, error) {
      logEmitter.emit('log', { level: 'trace', module, message, error });
    },
    debug(message, error) {
      logEmitter.emit('log', { level: 'debug', module, message, error });
    },
    info(message, error) {
      logEmitter.emit('log', { level: 'info', module, message, error });
    },
    warn(message, error) {
      logEmitter.emit('log', { level: 'warn', module, message, error });
    },
    error(message, error) {
      logEmitter.emit('log', { level: 'error', module, message, error });
    },
  };
}
