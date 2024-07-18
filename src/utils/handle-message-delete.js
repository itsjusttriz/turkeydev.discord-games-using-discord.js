import { ResultType } from './game-result.js';
import { playerGameMap } from './player-game-map.js';

/**
 * @param {string|undefined} guildId
 * @param {string} messageId
 * @returns {void}
 */
export const handleMessageDelete = (guildId, messageId) => {
	if (!guildId) return;

	const guidGames = playerGameMap.get(guildId);
	if (!guidGames) return;

	guidGames.forEach((game, userId) => {
		if (game.getMessageId() === messageId)
			game.gameOver({ result: ResultType.DELETED });
	});
};
