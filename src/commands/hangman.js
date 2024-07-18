import { SlashCommandBuilder } from 'discord.js';
import { handleGameInteraction } from '../utils/handle-game-interaction.js';

/**
 * @typedef {import('discord.js').ChatInputCommandInteraction} ChatInputCommandInteraction
 */

/**
 * @type {import('../utils/types').Command}
 */

export default {
	data: new SlashCommandBuilder()
		.setName('hangman')
		.setDescription('Play Hangman'),

	/**
	 * Execute the command
	 * @param {ChatInputCommandInteraction} interaction - The command interaction
	 * @returns {Promise<void>}
	 */
	async execute(interaction) {
		await handleGameInteraction(interaction);
	},
};
