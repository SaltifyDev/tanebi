import { MilkyApp } from '@/index';

export function configureEventTransformation(app: MilkyApp) {
    app.bot.onEvent('forceOffline', (title, tip) => {
        app.emitEvent('bot_offline', {
            reason: `[${title}] ${tip}`,
        });
    });
}