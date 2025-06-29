import { ReactionType } from 'tanebi';
import bot from '../login/fast';

bot.onEvent('groupReaction', async (group, sequence, member, reactionCode, isAdd) => {
    if (group.uin !== 0) return;
    if (member.uin === bot.uin) return;
    group?.sendReaction(
        sequence - 1,
        reactionCode,
        parseInt(reactionCode) >= 100000 ?
            ReactionType.Emoji : ReactionType.Face,
        isAdd
    );
});