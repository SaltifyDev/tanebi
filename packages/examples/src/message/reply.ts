import bot from '../login/fast';

bot.onPrivateMessage((friend, msg) => {
    friend.sendMsg(b => {
        b.reply(msg);
        b.text('Ciallo');
    });
});