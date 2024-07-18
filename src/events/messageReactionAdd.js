import { Events } from 'discord.js';
import { getPlayersGame } from '../utils/player-game-map.js';

/**
 * @typedef {import('discord.js').MessageReaction} MessageReaction
 * @typedef {import('discord.js').User} User
 */

export default {
	name: Events.MessageReactionAdd,
	once: false,

	/**
	 *
	 * @param {MessageReaction} reaction
	 * @param {User} user
	 */
	async execute(reaction, user) {
		const userId = user.id;
		const userGame = getPlayersGame(reaction.message.guildId ?? '', userId);
		if (!userGame) return;

		if (userGame.player1Turn && userId !== userGame.gameStarter.id) return;
		if (
			!userGame.player1Turn &&
			!!userGame.player2?.id &&
			userId !== userGame.player2.id
		)
			return;
		if (
			!userGame.player1Turn &&
			!userGame.player2?.id &&
			userId !== userGame.gameStarter.id
		)
			return;

		userGame.onReaction(reaction);
		reaction.remove();
	},
};
