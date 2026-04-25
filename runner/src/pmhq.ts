import { PMHQClient } from '@saltify/tanebi-client-pmhq';
import { Bot, BundledAppInfo } from 'tanebi';

const bot = new Bot(BundledAppInfo.Linux[46494], new PMHQClient());
await bot.initialize();
