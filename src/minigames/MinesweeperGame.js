import {
	ActionRowBuilder,
	EmbedBuilder,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
} from 'discord.js';
import GameBase from '../utils/game-base.js';
import { ResultType } from '../utils/game-result.js';

const WIDTH = 9;
const HEIGHT = 8;
const numberEmotes = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];

export default class MinesweeperGame extends GameBase {
	/**
	 * @private
	 * @type {string[]}
	 */
	gameBoard = [];

	/**
	 * @private
	 * @type {boolean[]}
	 */
	bombLocs = [];

	/**
	 * @private
	 * @type {import("../utils/position.js").Position}
	 */
	hoverLoc = { x: 0, y: 0 };

	constructor() {
		super('minesweeper', false);
	}

	/**
	 * @private
	 * @param {boolean} links
	 * @returns {string}
	 */
	gameBoardToString(links = true) {
		let str = '';
		for (let y = 0; y < HEIGHT; y++) {
			for (let x = 0; x < WIDTH; x++) {
				str += this.gameBoard[y * WIDTH + x];
			}
			str += '\n';
		}
		return str;
	}

	/**
	 * @public
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {import('discord.js').User|null} player2
	 * @param {typeof this.onGameEnd} onGameEnd
	 * @returns {void}
	 */
	newGame(interaction, player2, onGameEnd) {
		if (this.inGame) return;

		this.gameBoard = Array.from({ length: WIDTH * HEIGHT }, () => '⬜');
		this.bombLocs = Array.from({ length: WIDTH * HEIGHT }, () => false);

		this.gameBoard[0] = '🟪';
		this.hoverLoc = { x: 0, y: 0 };

		for (let i = 0; i < 7; i++) {
			const x = this.getRandomInt(WIDTH);
			const y = this.getRandomInt(HEIGHT);

			const index = y * WIDTH + x;

			if (!this.bombLocs[index]) this.bombLocs[index] = true;
			else i--;
		}

		super.newGame(interaction, player2, onGameEnd);
	}

	/**
	 * @private
	 * @returns {EmbedBuilder}
	 */
	getBaseEmbed() {
		return new EmbedBuilder()
			.setColor('#c7c7c7')
			.setTitle('Minesweeper')
			.setAuthor({
				name: 'Made By: TurkeyDev',
				iconURL: 'https://site.theturkey.dev/images/turkey_avatar.png',
				url: 'https://www.youtube.com/watch?v=j2ylF1AX1RY',
			})
			.setTimestamp();
	}

	/**
	 * @protected
	 * @returns {import('discord.js').MessageEditOptions}
	 */
	getContent() {
		const row1 = new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder()
				.setPlaceholder('column')
				.addOptions(
					...[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) =>
						new StringSelectMenuOptionBuilder({
							label: String.fromCharCode(65 + i),
							value: `${i}`,
						}).setDefault(this.hoverLoc.x === i)
					)
				)
		);
		const row2 = new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder()
				.setPlaceholder('row')
				.addOptions(
					...[0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
						new StringSelectMenuOptionBuilder({
							label: `${i + 1}`,
							value: `${i}`,
						}).setDefault(this.hoverLoc.y === i)
					)
				)
		);
		const row3 = super.createMessageActionRowButton([
			['uncover', '👆'],
			['flag', '🚩'],
		]);

		return {
			embeds: [
				this.getBaseEmbed()
					.setDescription(this.gameBoardToString())
					.addFields({
						name: 'How To Play:',
						value: 'Use the below select menus to choose a tile, then click the finger to reveal the tile, or the flag to flag the tile!',
						inline: false,
					})
					.setFooter({
						text: `Currently Playing: ${this.gameStarter.username}`,
					}),
			],
			components: [row1, row2, row3],
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
					`**GAME OVER!**\n${this.getWinnerText(
						result
					)}\n\n${this.gameBoardToString(false)}`
				),
			],
		};
	}

	/**
	 * @public
	 * @override
	 * @param {import('../utils/game-result.js').GameResult} result
	 * @param {import('discord.js').ChatInputCommandInteraction|import("discord.js").ButtonInteraction|undefined} interaction
	 * @returns {void}
	 */
	gameOver(result, interaction = undefined) {
		this.resetPosState(this.hoverLoc.y * WIDTH + this.hoverLoc.x);
		super.gameOver(result, interaction);
	}

	/**
	 * @protected
	 * @param {boolean} edit
	 * @returns {void}
	 */
	step(edit) {
		let lose = false;
		let win = true;
		for (let y = 0; y < HEIGHT; y++) {
			for (let x = 0; x < WIDTH; x++) {
				const index = y * WIDTH + x;
				if (
					(this.gameBoard[index] === '⬜' ||
						this.gameBoard[index] === '🟪') &&
					!this.bombLocs[index]
				)
					win = false;
				if (this.gameBoard[index] === '💣') lose = true;
				if (this.gameBoard[index] === '🚩' && !this.bombLocs[index])
					win = false;
			}
		}

		if (win) {
			this.gameOver({
				result: ResultType.WINNER,
				name: this.gameStarter.username,
				score: '',
			});
		} else if (lose) {
			this.showBombs();
			this.gameOver({
				result: ResultType.LOSER,
				name: this.gameStarter.username,
				score: '',
			});
		} else {
			super.step(edit);
		}
	}

	/**
	 * @public
	 * @param {import("discord.js").MessageReaction} reaction
	 * @returns {void}
	 */
	onReaction(reaction) {}

	/**
	 * @public
	 * @param {import('discord.js').SelectMenuInteraction} interaction
	 * @returns {void}
	 */
	onInteraction(interaction) {
		let currIndex = this.hoverLoc.y * WIDTH + this.hoverLoc.x;
		switch (interaction.customId) {
			case 'uncover':
				this.makeMove(this.hoverLoc.x, this.hoverLoc.y, true);
				break;
			case 'flag':
				this.makeMove(this.hoverLoc.x, this.hoverLoc.y, false);
				break;
			case 'row':
				this.resetPosState(currIndex);
				this.hoverLoc.y = parseInt(interaction.values[0]);
				currIndex = this.hoverLoc.y * WIDTH + this.hoverLoc.x;
				this.updatePosState(currIndex);
				break;
			case 'column':
				this.resetPosState(currIndex);
				this.hoverLoc.x = parseInt(interaction.values[0]);
				currIndex = this.hoverLoc.y * WIDTH + this.hoverLoc.x;
				this.updatePosState(currIndex);
				break;
		}

		this.step(false);
		interaction
			.update(this.getContent())
			.catch((e) => super.handleError(e, 'update interaction'));
	}

	/**
	 * @public
	 * @param {number} index
	 * @returns {void}
	 */
	resetPosState(index) {
		if (this.gameBoard[index] === '🟪') this.gameBoard[index] = '⬜';
		else if (this.gameBoard[index] === '🔳') this.gameBoard[index] = '⬛';
	}

	/**
	 * @public
	 * @param {number} index
	 * @returns {void}
	 */
	updatePosState(index) {
		if (this.gameBoard[index] === '⬜') this.gameBoard[index] = '🟪';
		else if (this.gameBoard[index] === '⬛') this.gameBoard[index] = '🔳';
	}

	/**
	 * @private
	 * @returns {void}
	 */
	showBombs() {
		this.gameBoard = this.gameBoard.map((v, i) =>
			this.bombLocs[i] ? '💣' : v
		);
	}

	/**
	 * @private
	 * @param {number} col
	 * @param {number} row
	 * @returns {void}
	 */
	uncover(col, row) {
		const index = row * WIDTH + col;
		if (this.bombLocs[index]) {
			this.gameBoard[index] = '💣';
		} else {
			let bombsAround = 0;
			for (let y = -1; y < 2; y++) {
				for (let x = -1; x < 2; x++) {
					if (
						col + x < 0 ||
						col + x >= WIDTH ||
						row + y < 0 ||
						row + y >= HEIGHT
					)
						continue;
					if (x === 0 && y === 0) continue;
					const i2 = (row + y) * WIDTH + (col + x);
					if (this.bombLocs[i2]) bombsAround++;
				}
			}
			if (bombsAround == 0) {
				if (col === this.hoverLoc.x && row === this.hoverLoc.y)
					this.gameBoard[index] = '🔳';
				else this.gameBoard[index] = '⬛';
				for (let y = -1; y < 2; y++) {
					for (let x = -1; x < 2; x++) {
						if (
							col + x < 0 ||
							col + x >= WIDTH ||
							row + y < 0 ||
							row + y >= HEIGHT
						)
							continue;
						if (x === 0 && y === 0) continue;
						const i2 = (row + y) * WIDTH + (col + x);
						if (this.gameBoard[i2] === '⬜')
							this.uncover(col + x, row + y);
					}
				}
			} else {
				this.gameBoard[index] = numberEmotes[bombsAround - 1];
			}
		}
	}

	/**
	 * @public
	 * @param {number} col
	 * @param {number} row
	 * @param {boolean} uncover
	 * @returns {void}
	 */
	makeMove(col, row, uncover) {
		const index = row * WIDTH + col;
		if (this.gameBoard[index] === '🟪') {
			if (uncover) this.uncover(col, row);
			else this.gameBoard[index] = '🚩';

			this.step(true);
		} else if (this.gameBoard[index] === '🚩' && !uncover) {
			this.gameBoard[index] = '🟪';
		}
	}

	/**
	 * @private
	 * @param {number} max
	 * @returns {number}
	 */
	getRandomInt(max) {
		return Math.floor(Math.random() * Math.floor(max));
	}
}
