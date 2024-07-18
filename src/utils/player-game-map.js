/**
 * @type {Map<string, Map<string, import("./game-base.js").default>>}
 */
export const playerGameMap = new Map();

/**
 * @param {string} guildId
 * @param {string} userId
 * @returns {import("./game-base.js").default|null}
 */
export const getPlayersGame = (guildId, userId) => {
	if (!guildId) return null;

	const guidGames = playerGameMap.get(guildId);
	if (!guidGames) return null;

	const userGame = guidGames.get(userId);
	if (!userGame) return null;

	return userGame;
};
