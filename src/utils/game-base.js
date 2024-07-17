import { ActionRowBuilder, ButtonBuilder } from 'discord.js';
import { ResultType } from './game-result.js';
import { DiscordButtonStyles } from './discord-button-styles.js';
import { DiscordAPIError } from './discord-api-error.js';

/**
 * @abstract
 */
export default class GameBase {
	/**
	 * @protected
	 * @type {number}
	 */
	gameId;

	/**
	 * @protected
	 * @type {string}
	 */
	gameType;

	/**
	 * @protected
	 * @type {boolean}
	 */
	isMultiplayerGame;

	/**
	 * @protected
	 * @type {boolean}
	 */
	inGame = false;

	/**
	 * @protected
	 * @type {import('./game-result.js').GameResult|undefined}
	 */
	result = undefined;

	/**
	 * @protected
	 * @type {import("discord.js").Message<true>|undefined}
	 */
	gameMessage = undefined;

	/**
	 * @public
	 * @type {import("discord.js").User}
	 */
	gameStarter;

	/**
	 * @public
	 * @type {import("discord.js").User|null}
	 */
	player2 = null;

	/**
	 * @public
	 * @type {Boolean}
	 */
	player1Turn = true;

	/**
	 * @protected
	 * @type {(result: import('./game-result.js').GameResult)=> void}
	 */
	onGameEnd = () => {};

	/**
	 * @protected
	 * @type {NodeJS.Timeout|undefined}
	 */
	gameTimeoutId;

	/**
	 * @protected
	 * @abstract
	 * @returns {import("discord.js").MessageEditOptions}
	 */
	getContent() {
		throw new Error('Method not implemented.');
	}

	/**
	 * @protected
	 * @abstract
	 * @param {import('./game-result.js').GameResult} result
	 * @returns {import('discord.js').MessageEditOptions}
	 */
	getGameOverContent(result) {
		throw new Error('Method not implemented.');
	}

	/**
	 * @public
	 * @abstract
	 * @param {import("discord.js").MessageReaction} reaction
	 * @returns {void}
	 */
	onReaction(reaction) {
		throw new Error('Method not implemented.');
	}

	/**
	 * @public
	 * @abstract
	 * @param {import("discord.js").Interaction} interaction
	 * @returns {void}
	 */
	onInteraction(interaction) {
		throw new Error('Method not implemented.');
	}

	/**
	 * @protected
	 * @param {string} gameType
	 * @param {boolean} isMultiplayerGame
	 */
	constructor(gameType, isMultiplayerGame) {
		this.gameType = gameType;
		this.isMultiplayerGame = isMultiplayerGame;
	}

	/**
	 * @public
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {import('discord.js').User|null} player2
	 * @param {typeof this.onGameEnd} onGameEnd
	 * @returns {void}
	 */
	newGame(interaction, player2, onGameEnd) {
		// @ts-ignore
		this.gameStarter = interaction.user ?? interaction.member?.user;
		this.player2 = player2;
		this.onGameEnd = onGameEnd;
		this.inGame = true;

		interaction.reply('Game started. Happy Playing!').catch(console.log);

		const content = this.getContent();
		interaction.channel
			?.send({ embeds: content.embeds, components: content.components })
			.then((msg) => {
				this.gameMessage = msg;
				this.gameTimeoutId = setTimeout(
					() => this.gameOver({ result: ResultType.TIMEOUT }),
					60000
				);
			})
			.catch((e) => this.handleError(e, 'send message/ embed'));
	}

	/**
	 * @protected
	 * @param {boolean} edit
	 * @returns {void}
	 */
	step(edit = false) {
		if (edit) this.gameMessage?.edit(this.getContent());

		if (this.gameTimeoutId) clearTimeout(this.gameTimeoutId);
		this.gameTimeoutId = setTimeout(
			() => this.gameOver({ result: ResultType.TIMEOUT }),
			60000
		);
	}

	/**
	 * @public
	 * @param {unknown} e
	 * @param {string} perm
	 * @returns {void}
	 */
	handleError(e, perm) {
		if (e instanceof DiscordAPIError) {
			/**
			 * @type {DiscordAPIError}
			 */
			const de = e;
			switch (de.code) {
				case 10003:
					this.gameOver({
						result: ResultType.ERROR,
						error: 'Channel not found!',
					});
					break;
				case 10008:
					this.gameOver({
						result: ResultType.DELETED,
						error: 'Message was deleted!',
					});
					break;
				case 10062:
					console.log('Unknown Interaction??');
					break;
				case 50001:
					if (this.gameMessage)
						this.gameMessage.channel
							.send(
								"The bot is missing access to preform some of it's actions!"
							)
							.catch(() => {
								console.log(
									'Error in the access error handler!'
								);
							});
					else console.log('Error in the access error handler!');

					this.gameOver({
						result: ResultType.ERROR,
						error: 'Missing access!',
					});
					break;
				case 50013:
					if (this.gameMessage)
						this.gameMessage.channel
							.send(
								`The bot is missing the '${perm}' permissions it needs order to work!`
							)
							.catch(() => {
								console.log(
									'Error in the permission error handler!'
								);
							});
					else console.log('Error in the permission error handler!');

					this.gameOver({
						result: ResultType.ERROR,
						error: 'Missing permissions!',
					});
					break;
				default:
					console.log('Encountered a Discord error not handled! ');
					console.log(e);
					break;
			}
		} else {
			this.gameOver({
				result: ResultType.ERROR,
				error: 'Game embed missing!',
			});
		}
	}

	/**
	 * @public
	 * @param {import('./game-result.js').GameResult} result
	 * @param {import('discord.js').ChatInputCommandInteraction|import("discord.js").ButtonInteraction|undefined} interaction
	 * @returns {void}
	 */
	gameOver(result, interaction = undefined) {
		if (!this.inGame) return;

		this.result = result;
		this.inGame = false;

		const gameOverContent = this.getGameOverContent(result);

		if (result.result !== ResultType.FORCE_END) {
			this.onGameEnd(result);
			this.gameMessage
				?.edit(gameOverContent)
				.catch((e) => this.handleError(e, ''));
			this.gameMessage?.reactions.removeAll().catch(console.log);
		} else {
			if (interaction)
				interaction
					.editReply(gameOverContent)
					.catch((e) => this.handleError(e, 'update interaction'));
			else
				this.gameMessage
					?.edit(gameOverContent)
					.catch((e) => this.handleError(e, ''));
		}

		if (this.gameTimeoutId) clearTimeout(this.gameTimeoutId);
	}

	/**
	 * @protected
	 * @param {import('./game-result.js').GameResult} result
	 * @returns {string}
	 */
	getWinnerText(result) {
		if (result.result === ResultType.TIE) return 'It was a tie!';
		else if (result.result === ResultType.TIMEOUT)
			return 'The game went unfinished :(';
		else if (result.result === ResultType.FORCE_END)
			return 'The game was ended';
		else if (result.result === ResultType.ERROR)
			return 'ERROR: ' + result.error;
		else if (result.result === ResultType.WINNER)
			return '`' + result.name + '` has won!';
		else if (result.result === ResultType.LOSER)
			return '`' + result.name + '` has lost!';
		return '';
	}

	/**
	 * @public
	 * @param {number} id
	 * @returns {void}
	 */
	setGameId(id) {
		this.gameId = id;
	}

	/**
	 * @public
	 * @returns {number}
	 */
	getGameId() {
		return this.gameId;
	}

	/**
	 * @public
	 * @returns {string}
	 */
	getGameType() {
		return this.gameType;
	}

	/**
	 * Message ID or ''
	 * @public
	 * @returns {string}
	 */
	getMessageId() {
		return this.gameMessage?.id ?? '';
	}

	/**
	 * @public
	 * @returns {boolean}
	 */
	isInGame() {
		return this.inGame;
	}

	/**
	 * @public
	 * @returns {boolean}
	 */
	doesSupportMultiplayer() {
		return this.isMultiplayerGame;
	}

	/**
	 * @public
	 * @param {string[][]} buttonInfo
	 * @returns {import("discord.js").ActionRowBuilder<any>}
	 */
	createMessageActionRowButton(buttonInfo) {
		return new ActionRowBuilder().addComponents(
			...buttonInfo.map(([id, label]) => {
				return new ButtonBuilder()
					.setStyle(DiscordButtonStyles.SECONDARY)
					.setCustomId(id)
					.setLabel(label);
			})
		);
	}
}
