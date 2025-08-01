import { MilkyApp } from '@/index';
import { transformIncomingFriendMessage, transformIncomingGroupMessage } from '@/transform/message/incoming';

export function configureEventTransformation(app: MilkyApp) {
    app.bot.onEvent('forceOffline', (title, tip) => {
        app.emitEvent('bot_offline', {
            reason: `[${title}] ${tip}`,
        });
    });

    app.bot.onPrivateMessage((friend, message) => {
        app.emitEvent('message_receive', transformIncomingFriendMessage(friend, message));
    });

    app.bot.onGroupMessage((group, member, message) => {
        app.emitEvent('message_receive', transformIncomingGroupMessage(group, member, message));
    });
}