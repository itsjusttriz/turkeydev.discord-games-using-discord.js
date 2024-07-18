import { EmbedBuilder } from 'discord.js';
import GameBase from '../utils/game-base.js';
import { ResultType } from '../utils/game-result.js';

const NO_MOVE = 0;
const PLAYER_1 = 1;
const PLAYER_2 = 2;

const cpu_mistake_chance = 5;

export default class TicTacToeGame extends GameBase {
	/**
	 * @private
	 * @type {string}
	 */
	message = '';

	/**
	 * @private
	 * @type {import("../utils/position.js").Position}
	 */
	computersMove = { x: 0, y: 0 };

	/**
	 * @private
	 * @type {import("../utils/position.js").Position}
	 */
	winningPoints = { x: -1, y: -1 };

	/**
	 * @private
	 * @type {number[][]}
	 */
	gameBoard = [
		[0, 0, 0],
		[0, 0, 0],
		[0, 0, 0],
	];

	constructor() {
		super('tictactoe', true);
	}

	/**
	 * @private
	 * @returns {string}
	 */
	getGameBoardStr() {
		let str = '';
		for (let y = 0; y < 3; y++) {
			for (let x = 0; x < 3; x++) {
				str += this.gameBoard[x][y];
			}
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

		for (let y = 0; y < 3; y++)
			for (let x = 0; x < 3; x++) this.gameBoard[x][y] = NO_MOVE;

		this.winningPoints = { x: -1, y: -1 };

		super.newGame(interaction, player2, onGameEnd);
	}

	/**
	 * @private
	 * @returns {EmbedBuilder}
	 */
	getBaseEmbed() {
		return new EmbedBuilder()
			.setColor('#ab0e0e')
			.setTitle('Tic-Tac-Toe')
			.setAuthor({
				name: 'Made By: TurkeyDev',
				iconURL: 'https://site.theturkey.dev/images/turkey_avatar.png',
				url: 'https://www.youtube.com/watch?v=tgY5rpPixlA',
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
		]);
		const row2 = super.createMessageActionRowButton([
			['4', '4️⃣'],
			['5', '5️⃣'],
			['6', '6️⃣'],
		]);
		const row3 = super.createMessageActionRowButton([
			['7', '7️⃣'],
			['8', '8️⃣'],
			['9', '9️⃣'],
		]);

		return {
			embeds: [
				this.getBaseEmbed()
					.setDescription(this.message)
					.addFields({ name: 'Turn:', value: this.getTurn() })
					.setImage(
						`https://api.theturkey.dev/discordgames/gentictactoeboard?gb=${this.getGameBoardStr()}&p1=-1&p2=-1`
					)
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
				this.getBaseEmbed()
					.setDescription('GAME OVER! ' + this.getWinnerText(result))
					.setImage(
						`https://api.theturkey.dev/discordgames/gentictactoeboard?gb=${this.getGameBoardStr()}&p1=${
							this.winningPoints.x
						}&p2=${this.winningPoints.y}`
					),
			],
		};
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
				.catch(() =>
					console.log('Failed to defer interaction for wrong player!')
				);
			return;
		}

		const customId = interaction.customId;
		if (!customId) {
			this.step(false);
			interaction
				.update(this.getContent())
				.catch((e) => super.handleError(e, 'update interaction'));
			return;
		}

		let index = parseInt(customId);
		if (index === undefined || index <= 0 || Number.isNaN(index)) {
			console.log('Error with index! ' + customId + ' -> ' + index);
			interaction
				.update(this.getContent())
				.catch((e) => super.handleError(e, 'update interaction'));
			return;
		}

		index -= 1;
		const x = index % 3;
		const y = Math.floor(index / 3);
		if (this.gameBoard[x][y] !== 0) {
			this.step(false);
			interaction
				.update(this.getContent())
				.catch((e) => super.handleError(e, 'update interaction'));
			return;
		}

		this.placeMove(x, y, this.player1Turn ? PLAYER_1 : PLAYER_2);
		this.player1Turn = !this.player1Turn;

		if (!this.isGameOver() && !this.player2 && !this.player1Turn) {
			//Make CPU Move
			this.minimax(0, PLAYER_2);
			const cpuIndex =
				this.computersMove.y * 3 + this.computersMove.x + 1;

			this.placeMove(
				this.computersMove.x,
				this.computersMove.y,
				PLAYER_2
			);
			this.player1Turn = true;
		}

		if (this.isGameOver()) {
			//Flip the turn back to the last player to place a piece
			this.player1Turn = !this.player1Turn;
			if (this.hasWon(PLAYER_2) || this.hasWon(PLAYER_1))
				this.gameOver(
					{
						result: ResultType.WINNER,
						name: this.getTurn(),
						score: this.getGameBoardStr(),
					},
					interaction
				);
			else
				this.gameOver(
					{ result: ResultType.TIE, score: this.getGameBoardStr() },
					interaction
				);
		} else {
			this.step(false);
			interaction
				.update(this.getContent())
				.catch((e) => super.handleError(e, 'update interaction'));
		}
	}

	/**
	 * @private
	 * @returns {string}
	 */
	getTurn() {
		return this.player1Turn
			? this.gameStarter.username
			: this.player2
			? this.player2?.username
			: 'CPU';
	}

	/**
	 * @private
	 * @returns {boolean}
	 */
	isGameOver() {
		if (this.hasWon(PLAYER_1) || this.hasWon(PLAYER_2)) return true;

		if (this.getAvailableStates().length == 0) {
			this.winningPoints = { x: -1, y: -1 };
			return true;
		}
		return false;
	}

	/**
	 * @private
	 * @param {number} player
	 * @returns {boolean}
	 */
	hasWon(player) {
		if (
			this.gameBoard[0][0] == this.gameBoard[1][1] &&
			this.gameBoard[0][0] == this.gameBoard[2][2] &&
			this.gameBoard[0][0] == player
		) {
			this.winningPoints = { x: 0, y: 8 };
			return true;
		}
		if (
			this.gameBoard[0][2] == this.gameBoard[1][1] &&
			this.gameBoard[0][2] == this.gameBoard[2][0] &&
			this.gameBoard[0][2] == player
		) {
			this.winningPoints = { x: 6, y: 2 };
			return true;
		}
		for (let i = 0; i < 3; ++i) {
			if (
				this.gameBoard[i][0] == this.gameBoard[i][1] &&
				this.gameBoard[i][0] == this.gameBoard[i][2] &&
				this.gameBoard[i][0] == player
			) {
				this.winningPoints = { x: i, y: i + 6 };
				return true;
			}

			if (
				this.gameBoard[0][i] == this.gameBoard[1][i] &&
				this.gameBoard[0][i] == this.gameBoard[2][i] &&
				this.gameBoard[0][i] == player
			) {
				this.winningPoints = { x: i * 3, y: i * 3 + 2 };
				return true;
			}
		}
		return false;
	}

	/**
	 * @private
	 * @returns {import("../utils/position.js").Position[]}
	 */
	getAvailableStates() {
		/**
		 * @type {import("../utils/position.js").Position[]}
		 */
		const availablePoints = [];
		for (let i = 0; i < 3; ++i)
			for (let j = 0; j < 3; ++j)
				if (this.gameBoard[i][j] == NO_MOVE)
					availablePoints.push({ x: i, y: j });
		return availablePoints;
	}

	/**
	 * @private
	 * @param {number} x
	 * @param {number} y
	 * @param {number} player
	 * @returns {void}
	 */
	placeMove(x, y, player) {
		this.gameBoard[x][y] = player;
	}

	/**
	 * @private
	 * @param {number} depth
	 * @param {number} turn
	 * @returns {number}
	 */
	minimax(depth, turn) {
		//Game status...
		if (this.hasWon(PLAYER_2)) return +1;
		if (this.hasWon(PLAYER_1)) return -1;

		const pointsAvailable = this.getAvailableStates();
		if (pointsAvailable.length === 0) return 0;

		if (
			depth == 0 &&
			Math.floor(Math.random() * Math.floor(cpu_mistake_chance)) == 2
		) {
			this.computersMove =
				pointsAvailable[
					Math.floor(
						Math.random() * Math.floor(pointsAvailable.length)
					)
				];
			return 0;
		}

		let min = Number.MAX_SAFE_INTEGER;
		let max = Number.MIN_SAFE_INTEGER;
		for (let i = 0; i < pointsAvailable.length; ++i) {
			const point = pointsAvailable[i];
			if (turn == PLAYER_2) {
				this.placeMove(point.x, point.y, PLAYER_2);
				const currentScore = this.minimax(depth + 1, PLAYER_1);
				max = Math.max(currentScore, max);

				if (currentScore >= 0 && depth == 0) this.computersMove = point;

				if (currentScore == 1) {
					this.gameBoard[point.x][point.y] = 0;
					break;
				}

				if (i == pointsAvailable.length - 1 && max < 0 && depth == 0)
					this.computersMove = point;
			} else if (turn == PLAYER_1) {
				this.placeMove(point.x, point.y, PLAYER_1);
				const currentScore = this.minimax(depth + 1, PLAYER_2);
				min = Math.min(currentScore, min);
				if (min == -1) {
					this.gameBoard[point.x][point.y] = 0;
					break;
				}
			}
			this.gameBoard[point.x][point.y] = 0;
		}
		return turn == PLAYER_2 ? max : min;
	}
}
