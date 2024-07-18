import { EmbedBuilder } from 'discord.js';
import GameBase from '../utils/game-base.js';
import { ResultType } from '../utils/game-result.js';

const WIDTH = 7;
const HEIGHT = 7;

export default class Connect4Game extends GameBase {
	/**
	 * @private
	 * @type {string[]}
	 */
	gameBoard;

	constructor() {
		super('connect4', true);
		this.gameBoard = Array.from({ length: WIDTH * HEIGHT }, () => '⚪');
	}

	/**
	 * @private
	 * @returns {string}
	 */
	gameBoardToString() {
		let str = '';
		if (!this.player2)
			str +=
				'Note there is no AI for this game, so you are just playing against yourself';
		str += '\n|1️⃣|2️⃣|3️⃣|4️⃣|5️⃣|6️⃣|7️⃣|\n';
		for (let y = 0; y < HEIGHT; y++) {
			for (let x = 0; x < WIDTH; x++)
				str += '|' + this.gameBoard[y * WIDTH + x];
			str += '|\n';
		}
		return str;
	}

	/**
	 * @public
	 * @override
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {import('discord.js').User|null} player2
	 * @param {typeof this.onGameEnd} onGameEnd
	 * @returns {void}
	 */
	newGame(interaction, player2, onGameEnd) {
		if (super.isInGame()) return;

		this.gameBoard = Array.from({ length: WIDTH * HEIGHT }, () => '⚪');
		super.newGame(interaction, player2, onGameEnd);
	}

	/**
	 * @private
	 * @returns {EmbedBuilder}
	 */
	getBaseEmbed() {
		return new EmbedBuilder()
			.setColor('#000b9e')
			.setTitle('Connect-4')
			.setAuthor({
				name: 'Made By: TurkeyDev',
				iconURL: 'https://site.theturkey.dev/images/turkey_avatar.png',
				url: 'https://www.youtube.com/watch?v=Sl1ZnvlNalI',
			})
			.setTimestamp();
	}

	/**
	 * @protected
	 * @returns {import('discord.js').MessageEditOptions}
	 */
	getContent() {
		const row1 = super.createMessageActionRowButton([
			['1', '1️⃣'],
			['2', '2️⃣'],
			['3', '3️⃣'],
			['4', '4️⃣'],
		]);
		const row2 = super.createMessageActionRowButton([
			['5', '5️⃣'],
			['6', '6️⃣'],
			['7', '7️⃣'],
		]);

		return {
			embeds: [
				this.getBaseEmbed()
					.setDescription(this.gameBoardToString())
					.addFields({ name: 'Turn:', value: this.getUserDisplay() })
					.setFooter({
						text: `Currently Playing: ${this.gameStarter.username}`,
					}),
			],
			components: [row1, row2],
		};
	}

	/**
	 * @protected
	 * @param {import('../utils/game-result.js').GameResult} result
	 * @returns {import('discord.js').MessageEditOptions}
	 */
	getGameOverContent(result) {
		return {
			embeds: [
				this.getBaseEmbed().setDescription(
					`**GAME OVER! ${this.getWinnerText(
						result
					)}**\n\n${this.gameBoardToString()}`
				),
			],
		};
	}

	/**
	 * @protected
	 * @returns {void}
	 */
	step() {
		this.player1Turn = !this.player1Turn;
		super.step(false);
	}

	/**
	 * @public
	 * @param {import("discord.js").MessageReaction} reaction
	 * @returns {void}
	 */
	onReaction(reaction) {}

	/**
	 * @public
	 * @param {import('discord.js').ButtonInteraction} interaction
	 * @returns {void}
	 */
	onInteraction(interaction) {
		const sender = interaction.member?.user?.id;
		const turnPlayerId = this.player1Turn
			? this.gameStarter.id
			: this.player2
			? this.player2.id
			: this.gameStarter.id;
		if (sender !== turnPlayerId) {
			interaction
				.deferUpdate()
				.catch((e) => super.handleError(e, 'defer interaction'));
			return;
		}

		const customId = interaction.customId;
		if (!customId) {
			this.step();
			interaction
				.deferUpdate()
				.catch((e) => super.handleError(e, 'defer interaction'));
			return;
		}

		let column = parseInt(customId);

		if (column === undefined) {
			interaction
				.deferUpdate()
				.catch((e) => super.handleError(e, 'defer interaction'));
			return;
		}

		column -= 1;
		let placedX = -1;
		let placedY = -1;

		for (let y = HEIGHT - 1; y >= 0; y--) {
			const chip = this.gameBoard[column + y * WIDTH];
			if (chip === '⚪') {
				this.gameBoard[column + y * WIDTH] = this.getChipFromTurn();
				placedX = column;
				placedY = y;
				break;
			}
		}

		if (this.hasWon(placedX, placedY)) {
			this.gameOver(
				{
					result: ResultType.WINNER,
					name: this.getUserDisplay(),
					score: this.getScore(),
				},
				interaction
			);
		} else if (this.isBoardFull()) {
			this.gameOver(
				{ result: ResultType.TIE, score: this.getScore() },
				interaction
			);
		} else {
			this.step();
			interaction
				.update(this.getContent())
				.catch((e) => super.handleError(e, 'update interaction'));
		}
	}

	/**
	 * @private
	 * @returns {string}
	 */
	getScore() {
		return this.gameBoard
			.map((chip) => (chip === '⚪' ? '0' : chip === '🔴' ? '1' : '2'))
			.join('');
	}

	/**
	 * @private
	 * @returns {string}
	 */
	getUserDisplay() {
		if (this.isMultiplayerGame && this.player2)
			return this.player1Turn
				? '🔴 ' + this.gameStarter.username
				: '🟡 ' + this.player2?.username ?? 'ERR';
		return this.getChipFromTurn();
	}

	/**
	 * @private
	 * @returns {string}
	 */
	getChipFromTurn() {
		return this.player1Turn ? '🔴' : '🟡';
	}

	/**
	 * @private
	 * @param {number} placedX
	 * @param {number} placedY
	 * @returns {boolean}
	 */
	hasWon(placedX, placedY) {
		const chip = this.getChipFromTurn();

		//Horizontal Check
		const y = placedY * WIDTH;
		for (
			let i = Math.max(0, placedX - 3);
			i <= Math.min(placedX, WIDTH - 1);
			i++
		) {
			const adj = i + y;
			if (i + 3 < WIDTH) {
				if (
					this.gameBoard[adj] === chip &&
					this.gameBoard[adj + 1] === chip &&
					this.gameBoard[adj + 2] === chip &&
					this.gameBoard[adj + 3] === chip
				)
					return true;
			}
		}

		//Vertical Check
		for (
			let i = Math.max(0, placedY - 3);
			i <= Math.min(placedY, HEIGHT - 1);
			i++
		) {
			const adj = placedX + i * WIDTH;
			if (i + 3 < HEIGHT) {
				if (
					this.gameBoard[adj] === chip &&
					this.gameBoard[adj + WIDTH] === chip &&
					this.gameBoard[adj + 2 * WIDTH] === chip &&
					this.gameBoard[adj + 3 * WIDTH] === chip
				)
					return true;
			}
		}

		//Ascending Diag
		for (let i = -3; i <= 0; i++) {
			const adjX = placedX + i;
			const adjY = placedY + i;
			if (adjX < 0 || adjY < 0) continue;
			const adj = adjX + adjY * WIDTH;
			if (adjX + 3 < WIDTH && adjY + 3 < HEIGHT) {
				if (
					this.gameBoard[adj] === chip &&
					this.gameBoard[adj + WIDTH + 1] === chip &&
					this.gameBoard[adj + 2 * WIDTH + 2] === chip &&
					this.gameBoard[adj + 3 * WIDTH + 3] === chip
				)
					return true;
			}
		}

		//Descending Diag
		for (let i = -3; i <= 0; i++) {
			const adjX = placedX + i;
			const adjY = placedY - i;
			if (adjX < 0 || adjY < 0) continue;
			const adj = adjX + adjY * WIDTH;
			if (adjX + 3 < WIDTH && adjY - 3 >= 0) {
				if (
					this.gameBoard[adj] === chip &&
					this.gameBoard[adj - WIDTH + 1] === chip &&
					this.gameBoard[adj - 2 * WIDTH + 2] === chip &&
					this.gameBoard[adj - 3 * WIDTH + 3] === chip
				)
					return true;
			}
		}

		return false;
	}

	/**
	 * @private
	 * @returns {boolean}
	 */
	isBoardFull() {
		return !this.gameBoard.includes('⚪');
	}
}
