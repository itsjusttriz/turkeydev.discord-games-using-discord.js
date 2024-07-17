import { Events } from 'discord.js';

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
		// TODO
		// const userGame = getPlayersGame(interaction.guild_id as Snowflake, interaction.member?.user?.id as Snowflake);

		if (interaction.isChatInputCommand()) {
			const guildId = interaction.guild?.id;
			if (!guildId) {
				interaction
					.reply('This command can only be run inside a guild!')
					.catch(console.log);
				return;
			}

			const userId = interaction.member?.user?.id ?? interaction.user?.id;
			const command = interaction.commandName;

			if (!command || !userId) {
				interaction
					.reply(
						'The command or user was missing somehow.... awkward...'
					)
					.catch(console.log);
				return;
			}

			return;
		}

		// TODO
		//  if (!userGame) {
		// 		interaction.deferUpdate().catch(console.log);
		// 		return;
		// 	}

		// 	userGame.onInteraction(interaction);
	},
};
