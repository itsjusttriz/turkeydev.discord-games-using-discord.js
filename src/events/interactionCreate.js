import { Events } from 'discord.js';
import { getPlayersGame } from '../utils/player-game-map.js';

/**
 * @typedef {import('discord.js').Interaction} Interaction
 */

export default {
	name: Events.InteractionCreate,
	once: false,

	/**
	 *
	 * @param {Interaction} interaction
	 */
	async execute(interaction) {
		if (interaction.isCommand()) {
			const guildId = interaction.guild?.id;
			if (!guildId) {
				interaction
					.reply('This command can only be run inside a guild!')
					.catch(console.log);
				return;
			}

			if (!interaction.commandName || !interaction.user.id) {
				interaction
					.reply(
						'The command or user was missing somehow.... awkward...'
					)
					.catch(console.log);
				return;
			}

			/**
			 * @type {import("../utils/types.js").Command}
			 */
			// @ts-ignore
			const command = interaction.client.commands.get(
				interaction.commandName
			);

			if (!command) return;

			try {
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				await interaction.reply({
					content: 'There was an error while executing this command!',
					ephemeral: true,
				});
			}
		}

		if (interaction.guild && 'deferUpdate' in interaction) {
			const userGame = getPlayersGame(
				interaction.guild.id,
				interaction.user.id
			);
			if (!userGame) {
				interaction.deferUpdate().catch(console.log);
				return;
			}

			userGame.onInteraction(interaction);
		}
	},
};
