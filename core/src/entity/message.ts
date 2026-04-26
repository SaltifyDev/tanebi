import type { ImageFormat, ImageSubType } from '../common';

export type MessageScene = 'friend' | 'group' | 'temp';

export interface BotIncomingMessage {
  scene: MessageScene;
  peerUin: number;
  peerUid: string;
  sequence: number;
  timestamp: number;
  senderUin: number;
  senderUid: string;
  clientSequence: number;
  random: number;
  messageUid: bigint;
  segments: BotIncomingSegment[];
  extraInfo?: BotIncomingMessageExtraInfo;
}

export interface BotIncomingMessageExtraInfo {
  nick: string;
  card: string;
  specialTitle: string;
}

export type BotIncomingSegment =
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'mention';
      uin?: number;
      name: string;
    }
  | {
      type: 'face';
      faceId: number;
      summary: string;
      isLarge: boolean;
    }
  | {
      type: 'reply';
      sequence: number;
      senderUin: number;
      senderName?: string;
      timestamp: number;
      segments: BotIncomingSegment[];
    }
  | {
      type: 'image';
      fileId: string;
      width: number;
      height: number;
      subType: ImageSubType;
      summary: string;
    }
  | {
      type: 'record';
      fileId: string;
      duration: number;
    }
  | {
      type: 'video';
      fileId: string;
      duration: number;
      width: number;
      height: number;
    }
  | {
      type: 'file';
      fileId: string;
      fileName: string;
      fileSize: number;
      fileHash?: string;
    }
  | {
      type: 'forward';
      resId: string;
      title: string;
      preview: string[];
      summary: string;
    }
  | {
      type: 'marketFace';
      url: string;
      summary: string;
      emojiId: string;
      emojiPackageId: number;
      key: string;
    }
  | {
      type: 'lightApp';
      appName: string;
      jsonPayload: string;
    };

export interface BotForwardedMessage {
  sequence: number;
  senderName: string;
  avatarUrl: string;
  timestamp: number;
  segments: BotIncomingSegment[];
}

export interface BotHistoryMessages {
  messages: BotIncomingMessage[];
  nextStartSequence?: number;
}

export type BotOutgoingSegment =
  | {
      type: 'text';
      text: string;
    }
  | {
      type: 'mention';
      uin?: number;
      name: string;
    }
  | {
      type: 'face';
      faceId: number;
      isLarge?: boolean;
    }
  | {
      type: 'reply';
      sequence: number;
    }
  | {
      type: 'image';
      data: Buffer;
      format: ImageFormat;
      width: number;
      height: number;
      subType?: ImageSubType;
      summary?: string;
    }
  | {
      type: 'record';
      data: Buffer;
      duration: number;
    }
  | {
      type: 'video';
      data: Buffer;
      width: number;
      height: number;
      duration: number;
      thumb: Buffer;
      thumbFormat: ImageFormat;
    }
  | {
      type: 'forward';
      nodes: BotOutgoingForwardNode[];
      title?: string;
      preview?: string[];
      summary?: string;
      prompt?: string;
    }
  | {
      type: 'lightApp';
      jsonPayload: string;
    };

export interface BotOutgoingForwardNode {
  senderUin: number;
  senderName: string;
  segments: BotOutgoingSegment[];
}

export interface BotOutgoingMessageResult {
  sequence: number;
  sendTime: number;
}

export interface BotOutgoingMessageOptions {
  clientSequence?: number;
  random?: number;
}
