import { BotGroupFile } from '@/entity/file/BotGroupFile';
import { BotGroupFolder } from '@/entity/file/BotGroupFolder';

export type { BotGroupFile, BotGroupFolder };
export type BotGroupFileSystemEntry = BotGroupFile | BotGroupFolder;