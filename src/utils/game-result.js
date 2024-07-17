/**
 * Enum for the types of game results.
 * @readonly
 * @enum {string}
 */
export const ResultType = {
	TIMEOUT: 'timeout',
	FORCE_END: 'force_end',
	WINNER: 'winner',
	LOSER: 'loser',
	TIE: 'tie',
	ERROR: 'error',
	DELETED: 'deleted',
};

/**
 * @typedef {Object} GameResult
 * @property {ResultType} result - The result of the game.
 * @property {string} [error] - Optional error message if there is an error.
 * @property {string} [name] - Optional name associated with the game result.
 * @property {string} [score] - Optional score related to the game result.
 */
