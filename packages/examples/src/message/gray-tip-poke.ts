import bot from '../login/fast';

bot.onPrivateMessage((friend) => {
    if (friend.uin !== 0) return;
    friend.sendGrayTipPoke();
});

bot.onGroupMessage((grp, member) => {
    if (grp.uin !== 0) return;
    member.sendGrayTipPoke();
});