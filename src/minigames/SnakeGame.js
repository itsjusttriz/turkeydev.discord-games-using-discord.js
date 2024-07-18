import { EmbedBuilder } from 'discord.js';
import GameBase from '../utils/game-base.js';
import { ResultType } from '../utils/game-result.js';

const WIDTH = 15;
const HEIGHT = 10;

export default class SnakeGame extends GameBase {
	/**
	 * @private
	 * @type {string[]}
	 */
	gameBoard = [];
	/**
	 * @private
	 * @type {import("../utils/position.js").Position}
	 */
	apple = { x: 1, y: 1 };
	/**
	 * @private
	 * @type {import("../utils/position.js").Position[]}
	 */
	snake = [];
	/**
	 * @private
	 * @type {number}
	 */
	snakeLength;
	/**
	 * @private
	 * @type {number}
	 */
	score;

	constructor() {
		super('snake', false);
		this.snake.push({ x: 5, y: 5 });
		this.snakeLength = 1;
		this.score = 0;
		this.gameBoard = Array.from({ length: WIDTH * HEIGHT }, () => '🟦');
	}

	/**
	 * @protected
	 * @returns {string}
	 */
	getGameBoard() {
		let str = '';
		for (let y = 0; y < HEIGHT; y++) {
			for (let x = 0; x < WIDTH; x++) {
				if (x == this.apple.x && y == this.apple.y) {
					str += '🍎';
					continue;
				}

				let flag = true;
				for (let s = 0; s < this.snake.length; s++) {
					if (x === this.snake[s].x && y === this.snake[s].y) {
						if (s === 0) {
							if (this.inGame) str += '🐍';
							else str += '☠️';
						} else {
							str += '🟩';
						}
						flag = false;
					}
				}

				if (flag) str += this.gameBoard[y * WIDTH + x];
			}
			str += '\n';
		}
		return str;
	}

	/**
	 * @private
	 * @param {import("../utils/position.js").Position} pos
	 * @returns {boolean}
	 */
	isLocInSnake(pos) {
		return (
			this.snake.find((sPos) => sPos.x == pos.x && sPos.y == pos.y) !==
			undefined
		);
	}

	/**
	 * @private
	 * @returns {void}
	 */
	newAppleLoc() {
		const newApplePos = { x: 0, y: 0 };
		do {
			newApplePos.x = Math.floor(Math.random() * WIDTH);
			newApplePos.y = Math.floor(Math.random() * HEIGHT);
		} while (this.isLocInSnake(newApplePos));

		this.apple.x = newApplePos.x;
		this.apple.y = newApplePos.y;
	}

	/**
	 * @public
	 * @param {import('discord.js').ChatInputCommandInteraction} interaction
	 * @param {import('discord.js').User|null} player2
	 * @param {typeof this.onGameEnd} onGameEnd
	 * @returns {void}
	 */
	newGame(interaction, player2, onGameEnd) {
		if (super.isInGame()) return;
		this.score = 0;
		this.snakeLength = 1;
		this.snake = [{ x: 5, y: 5 }];
		this.newAppleLoc();
		super.newGame(interaction, player2, onGameEnd);
	}

	/**
	 * @private
	 * @returns {EmbedBuilder}
	 */
	getBaseEmbed() {
		return new EmbedBuilder()
			.setColor('#03ad03')
			.setTitle('Snake Game')
			.setAuthor({
				name: 'Made By: TurkeyDev',
				iconURL: 'https://site.theturkey.dev/images/turkey_avatar.png',
				url: 'https://www.youtube.com/watch?v=tk5c0t72Up4',
			})
			.setTimestamp();
	}

	/**
	 * @protected
	 * @returns {import('discord.js').MessageEditOptions}
	 */
	getContent() {
		const row = super.createMessageActionRowButton([
			['left', '⬅️'],
			['up', '⬆️'],
			['right', '➡️'],
			['down', '⬇️'],
		]);

		return {
			embeds: [
				this.getBaseEmbed()
					.setDescription(this.getGameBoard())
					.setFooter({
						text: `Currently Playing: ${this.gameStarter.username}`,
					}),
			],
			components: [row],
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
					.setDescription(
						`**GAME OVER!**\nScore: ${
							this.score
						}\n\n${this.getGameBoard()}`
					)
					.setFooter({
						text: `Player: ${this.gameStarter.username}`,
					}),
			],
		};
	}

	/**
	 * @protected
	 * @returns {void}
	 */
	step() {
		if (
			this.apple.x == this.snake[0].x &&
			this.apple.y == this.snake[0].y
		) {
			this.score += 1;
			this.snakeLength++;
			this.newAppleLoc();
		}
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
		const snakeHead = this.snake[0];
		const nextPos = { x: snakeHead.x, y: snakeHead.y };
		let nextX;
		let nextY;
		switch (interaction.customId) {
			case 'left':
				nextX = snakeHead.x - 1;
				if (nextX < 0) {
					this.gameOver(
						{
							result: ResultType.LOSER,
							score: this.score.toString(),
						},
						interaction
					);
					return;
				}
				nextPos.x = nextX;
				break;
			case 'up':
				nextY = snakeHead.y - 1;
				if (nextY < 0) {
					this.gameOver(
						{
							result: ResultType.LOSER,
							score: this.score.toString(),
						},
						interaction
					);
					return;
				}
				nextPos.y = nextY;
				break;
			case 'down':
				nextY = snakeHead.y + 1;
				if (nextY >= HEIGHT) {
					this.gameOver(
						{
							result: ResultType.LOSER,
							score: this.score.toString(),
						},
						interaction
					);
					return;
				}
				nextPos.y = nextY;
				break;
			case 'right':
				nextX = snakeHead.x + 1;
				if (nextX >= WIDTH) {
					this.gameOver(
						{
							result: ResultType.LOSER,
							score: this.score.toString(),
						},
						interaction
					);
					return;
				}
				nextPos.x = nextX;
				break;
		}

		if (this.isLocInSnake(nextPos)) {
			this.gameOver(
				{ result: ResultType.LOSER, score: this.score.toString() },
				interaction
			);
		} else {
			this.snake.unshift(nextPos);
			if (this.snake.length > this.snakeLength) this.snake.pop();
			this.step();
			interaction
				.update(this.getContent())
				.catch((e) => super.handleError(e, 'update interaction'));
		}
	}
}
