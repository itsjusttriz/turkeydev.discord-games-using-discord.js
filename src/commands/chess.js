import { SlashCommandBuilder } from 'discord.js';

/**
 * @typedef {import('discord.js').ChatInputCommandInteraction} ChatInputCommandInteraction
 */

/**
 * @type {import('../utils/types').Command}
 */

export default {
	data: new SlashCommandBuilder()
		.setName('chess')
		.setDescription('Play Chess')
		.addUserOption((opt) => {
			return opt
				.setName('vs')
				.setDescription('User you wish to play against');
		}),

	/**
	 * Execute the command
	 * @param {ChatInputCommandInteraction} interaction - The command interaction
	 * @returns {Promise<void>}
	 */
	async execute(interaction) {
		await interaction.reply({
			content: 'This has not been configured yet.',
			ephemeral: true,
		});
	},
};
