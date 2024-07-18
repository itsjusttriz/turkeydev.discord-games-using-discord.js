import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

/**
 * @typedef {import('discord.js').ChatInputCommandInteraction} ChatInputCommandInteraction
 */

/**
 * @type {import('../utils/types').Command}
 */

export default {
	data: new SlashCommandBuilder()
		.setName('listgames')
		.setDescription('List available games'),

	/**
	 * Execute the command
	 * @param {ChatInputCommandInteraction} interaction - The command interaction
	 * @returns {Promise<void>}
	 */
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('#fc2eff')
			.setTitle('Available Games')
			.setDescription(
				`
                🐍 - Snake (/snake)
                
                🅰️ - Hangman (/hangman)
                
                🔵 - Connect4 (/connect4)
                
                💣 - Minesweeper (/minesweeper)
                
                ♟️ - Chess (/chess)
                
                ❌ - Tic-Tac-Toe (/tictactoe)
                
                🟪 - Flood (/flood)
                
                8️⃣ - 2048 (/2048)
                `
			)
			.setTimestamp();

		interaction
			.reply({
				embeds: [embed],
			})
			.catch((_) => console.log('Failed to send list games'));
	},
};
