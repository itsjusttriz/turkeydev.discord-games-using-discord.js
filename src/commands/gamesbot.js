import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

/**
 * @typedef {import('discord.js').CommandInteraction} CommandInteraction
 */

/**
 * @type {import('../utils/types').Command}
 */

export default {
	data: new SlashCommandBuilder()
		.setName('gamesbot')
		.setDescription('GamesBot help and info'),

	/**
	 * Execute the command
	 * @param {CommandInteraction} interaction - The command interaction
	 * @returns {Promise<void>}
	 */
	async execute(interaction) {
		const embed = new EmbedBuilder()
			.setColor('#fc2eff')
			.setTitle('Games Bot')
			.setDescription(
				'Welcome to GamesBot!\n\nThis bot adds lots of little games that you can play right from your Discord chat!\n\nUse `/listgames` to list all available games!\n\nAll games are started via slash commands (ex: `/flood`) and any game can be ended using `/endgame`.\n\nOnly 1 instance of each game may be active at a time and a user can only be playing 1 instance of a game at a time'
			)
			.setTimestamp();

		interaction
			.reply({
				embeds: [embed],
			})
			.catch((_) => console.log('Failed to send games bot'));
	},
};
