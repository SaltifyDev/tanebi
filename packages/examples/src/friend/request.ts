import bot from '../login/fast';

bot.onEvent('friendRequest', (req) => {
    console.log(req);
    if (req.message.includes('accept')) {
        req.handle(true);
    }
    if (req.message.includes('reject')) {
        req.handle(false);
    }
});