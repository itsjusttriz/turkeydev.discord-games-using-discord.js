import { commandGameMap } from './command-game-map.js';
import { getPlayersGame, playerGameMap } from './player-game-map.js';

/**
 * @param {import("discord.js").ChatInputCommandInteraction} interaction
 */
export const handleGameInteraction = async (interaction) => {
	const userGame = getPlayersGame(interaction.guild.id, interaction.user.id);

	if (Object.keys(commandGameMap).includes(interaction.commandName)) {
		const game = commandGameMap[interaction.commandName]();

		const player2Option = interaction.options.getUser('vs');
		/**
		 * @type {import("discord.js").User|undefined}
		 */
		let player2;
		if (player2Option) {
			if (!game.doesSupportMultiplayer()) {
				interaction
					.reply('Sorry that game is not a multiplayer game!')
					.catch(console.log);
				return;
			} else {
				const users = interaction.client.users.cache;
				const player2Id = player2Option.id;
				player2 = player2Id && users ? users.get(player2Id) : undefined;
			}
		}
		if (interaction.user.id === player2?.id) {
			interaction
				.reply('You cannot play against yourself!')
				.catch(console.log);
			return;
		}

		if (!playerGameMap.has(interaction.guild.id))
			playerGameMap.set(interaction.guild.id, new Map());

		if (userGame) {
			interaction
				.reply(
					'You must either finish or end your current game (`/endgame`) before you can play another!'
				)
				.catch(console.log);
			return;
		} else if (
			player2 &&
			playerGameMap.get(interaction.guild.id)?.has(player2.id)
		) {
			interaction
				.reply(
					'The person you are trying to play against is already in a game!'
				)
				.catch(console.log);
			return;
		}

		const foundGame = Array.from(
			playerGameMap.get(interaction.guild.id)?.values() ?? []
		).find((g) => g.getGameId() === game.getGameId());
		if (foundGame !== undefined && foundGame.isInGame()) {
			interaction
				.reply(
					'Sorry, there can only be 1 instance of a game at a time!'
				)
				.catch(console.log);
			return;
		}

		game.newGame(interaction, player2 ?? null, (result) => {
			playerGameMap
				.get(interaction.guild.id)
				?.delete(interaction.user.id);
			if (player2)
				playerGameMap.get(interaction.guild.id)?.delete(player2.id);
		});
		playerGameMap.get(interaction.guild.id)?.set(interaction.user.id, game);
		if (player2)
			playerGameMap.get(interaction.guild.id)?.set(player2.id, game);
	}
};
