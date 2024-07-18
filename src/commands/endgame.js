import { SlashCommandBuilder } from 'discord.js';

/**
 * @typedef {import('discord.js').ChatInputCommandInteraction} ChatInputCommandInteraction
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
	 * @param {ChatInputCommandInteraction} interaction - The command interaction
	 * @returns {Promise<void>}
	 */
	async execute(interaction) {
		await interaction.reply({
			content: 'This has not been configured yet.',
			ephemeral: true,
		});

		// TODO:
		// const playerGame = playerGameMap.get(guildId);
		// if (!!playerGame && playerGame.has(userId)) {
		//     const game = playerGame.get(userId);
		//     if (game) {
		//         game.gameOver({ result: ResultType.FORCE_END });
		//         if (game?.player2)
		//             playerGame.delete(game.player2.id);
		//     }
		//     playerGame.delete(userId);
		//     const resp =
		//         new DiscordInteractionResponseMessageData();
		//     resp.content = 'Your game was ended!';
		//     interaction.respond(resp).catch(console.log);
		//     return;
		// }
		// const resp = new DiscordInteractionResponseMessageData();
		// resp.content = 'Sorry! You must be in a game first!';
		// interaction.respond(resp).catch(console.log);
		// return;
	},
};
