import bot from '../login/fast';
import { BotFriendMessageEvent, BotGroupMessageEvent } from '@saltify/tanebi';

bot.subscribe(BotFriendMessageEvent, (event) => {
    console.log(`[${event.friend}] ${event.message.segments.map(s => s.toPreviewString()).join('')}`);
});

bot.subscribe(BotGroupMessageEvent, (event) => {
    console.log(`[${event.group}] [${event.groupMember}] ${event.message.segments.map(s => s.toPreviewString()).join('')}`);
});
