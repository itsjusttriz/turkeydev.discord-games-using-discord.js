import { SlashCommandBuilder } from 'discord.js';
import { playerGameMap } from '../utils/player-game-map.js';
import { ResultType } from '../utils/game-result.js';

/**
 * @typedef {import('discord.js').CommandInteraction} CommandInteraction
 */

/**
 * @type {import('../utils/types').Command}
 */

export default {
	data: new SlashCommandBuilder()
		.setName('endgame')
		.setDescription('End the game you are currently playing'),

	/**
	 * Execute the command
	 * @param {CommandInteraction} interaction - The command interaction
	 * @returns {Promise<void>}
	 */
	async execute(interaction) {
		const playerGame = playerGameMap.get(interaction.guild.id);
		if (!!playerGame && playerGame.has(interaction.user.id)) {
			const game = playerGame.get(interaction.user.id);
			if (game) {
				game.gameOver({ result: ResultType.FORCE_END });
				if (game?.player2) playerGame.delete(game.player2.id);
			}
			playerGame.delete(interaction.user.id);
			interaction.reply('Your game has ended!').catch(console.log);
			return;
		}
		interaction
			.reply('Sorry! You must be in a game first!')
			.catch(console.log);
		return;
	},
};
