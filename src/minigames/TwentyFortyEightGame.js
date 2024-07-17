import { EmbedBuilder } from 'discord.js';
import GameBase from '../utils/game-base.js';
import { Direction, oppositeDir } from '../utils/direction.js';
import { ResultType } from '../utils/game-result.js';
import { isInside, move, posEqual } from '../utils/position.js';

const WIDTH = 4;
const HEIGHT = 4;

/**
 * @extends {GameBase}
 */
export default class TwentyFortyEightGame extends GameBase {
	/**
	 * @type {number[]}
	 */
	gameBoard;

	/**
	 * @type {(import("../utils/position.js").Position)[]}
	 */
	mergedPos;

	/**
	 * @type {number}
	 */
	score;

	constructor() {
		super('2048', false);
		this.mergedPos = [];
		this.gameBoard = Array.from({ length: WIDTH * HEIGHT }, () => 0);
		this.placeRandomNewTile();
		this.score = 0;
	}

	/**
	 * @private
	 * @returns {EmbedBuilder}
	 */
	getBaseEmbed() {
		return new EmbedBuilder()
			.setColor('#f2e641')
			.setTitle('2048')
			.setAuthor({
				name: 'Made By: TurkeyDev',
				iconURL: 'https://site.theturkey.dev/images/turkey_avatar.png',
				url: 'https://www.youtube.com/watch?v=zHyKnlUWnp8',
			})
			.setImage(
				`https://api.theturkey.dev/discordgames/gen2048?gb=${this.gameBoard.join(
					','
				)}`
			)
			.setTimestamp();
	}

	/**
	 * @protected
	 * @override
	 * @returns {import('discord.js').MessageEditOptions}
	 */
	getContent() {
		const row = super.createMessageActionRowButton([
			['left', '⬅️'],
			['up', '⬆️'],
			['right', '➡️'],
			['down', '⬇️'],
		]);

		const embed = this.getBaseEmbed()
			.addFields({ name: 'Score:', value: this.score.toString() })
			.setFooter({
				text: `Currently Playing: ${this.gameStarter.username}`,
			});

		return {
			embeds: [embed],
			components: [row],
		};
	}

	/**
	 * @protected
	 * @override
	 * @param {import('../utils/game-result.js').GameResult} result
	 * @returns {import('discord.js').MessageEditOptions}
	 */
	getGameOverContent(result) {
		return {
			embeds: [
				new EmbedBuilder()
					.setDescription(`GAME OVER!\nScore: ${this.score}`)
					.setFooter({
						text: `Player: ${this.gameStarter.username}`,
					}),
			],
		};
	}

	/**
	 * @private
	 * @returns {void}
	 */
	placeRandomNewTile() {
		const newPos = { x: 0, y: 0 };
		do {
			newPos.x = Math.floor(Math.random() * WIDTH);
			newPos.y = Math.floor(Math.random() * HEIGHT);
		} while (this.gameBoard[newPos.y * WIDTH + newPos.x] != 0);

		this.gameBoard[newPos.y * WIDTH + newPos.x] =
			Math.random() * 100 < 25 ? 2 : 1;
	}

	/**
	 * @private
	 * @returns {boolean}
	 */
	shiftLeft() {
		let moved = false;
		for (let y = 0; y < HEIGHT; y++)
			for (let x = 1; x < WIDTH; x++)
				moved = this.shift({ x, y }, Direction.LEFT) || moved;
		return moved;
	}

	/**
	 * @private
	 * @returns {boolean}
	 */
	shiftRight() {
		let moved = false;
		for (let y = 0; y < HEIGHT; y++)
			for (let x = WIDTH - 2; x >= 0; x--)
				moved = this.shift({ x, y }, Direction.RIGHT) || moved;
		return moved;
	}

	/**
	 * @private
	 * @returns {boolean}
	 */
	shiftUp() {
		let moved = false;
		for (let x = 0; x < WIDTH; x++)
			for (let y = 1; y < HEIGHT; y++)
				moved = this.shift({ x, y }, Direction.UP) || moved;
		return moved;
	}

	/**
	 * @private
	 * @returns {boolean}
	 */
	shiftDown() {
		let moved = false;
		for (let x = 0; x < WIDTH; x++)
			for (let y = HEIGHT - 2; y >= 0; y--)
				moved = this.shift({ x, y }, Direction.DOWN) || moved;
		return moved;
	}

	/**
	 * @private
	 * @param {import("../utils/position.js").Position} pos
	 * @param {Direction} dir
	 * @returns {boolean}
	 */
	shift(pos, dir) {
		let moved = false;
		const movingNum = this.gameBoard[pos.y * WIDTH + pos.x];
		if (movingNum === 0) return false;

		let moveTo = pos;
		let set = false;
		while (!set) {
			moveTo = move(moveTo, dir);
			const moveToNum = this.gameBoard[moveTo.y * WIDTH + moveTo.x];
			if (
				!isInside(moveTo, WIDTH, HEIGHT) ||
				(moveToNum != 0 && moveToNum !== movingNum) ||
				!!this.mergedPos.find(
					(p) => p.x === moveTo.x && p.y === moveTo.y
				)
			) {
				const oppDir = oppositeDir(dir);
				const moveBack = move(moveTo, oppDir);
				if (!posEqual(moveBack, pos)) {
					this.gameBoard[pos.y * WIDTH + pos.x] = 0;
					this.gameBoard[moveBack.y * WIDTH + moveBack.x] = movingNum;
					moved = true;
				}
				set = true;
			} else if (moveToNum === movingNum) {
				moved = true;
				this.gameBoard[moveTo.y * WIDTH + moveTo.x] += 1;
				this.score += Math.floor(
					Math.pow(this.gameBoard[moveTo.y * WIDTH + moveTo.x], 2)
				);
				this.gameBoard[pos.y * WIDTH + pos.x] = 0;
				set = true;
				this.mergedPos.push(moveTo);
			}
		}
		return moved;
	}

	/**
	 * @private
	 * @returns {boolean}
	 */
	isBoardFull() {
		return !this.gameBoard.includes(0);
	}

	/**
	 * @private
	 * @returns {number}
	 */
	numMovesPossible() {
		let numMoves = 0;
		for (let y = 0; y < HEIGHT; y++) {
			for (let x = 0; x < WIDTH; x++) {
				const pos = { x, y };
				const posNum = this.gameBoard[pos.y * WIDTH + pos.x];
				[
					Direction.DOWN,
					Direction.LEFT,
					Direction.RIGHT,
					Direction.UP,
				].forEach((dir) => {
					const newPos = move(pos, dir);
					if (
						isInside(newPos, WIDTH, HEIGHT) &&
						(this.gameBoard[newPos.y * WIDTH + newPos.x] === 0 ||
							this.gameBoard[newPos.y * WIDTH + newPos.x] ===
								posNum)
					)
						numMoves++;
				});
			}
		}
		return numMoves;
	}

	/**
	 * @public
	 * @param {import("discord.js").ButtonInteraction} interaction
	 * @returns {void}
	 */
	onInteraction(interaction) {
		if (!interaction.isButton()) return;

		let moved = false;
		this.mergedPos = [];
		switch (interaction.customId) {
			case 'left':
				moved = this.shiftLeft();
				break;
			case 'up':
				moved = this.shiftUp();
				break;
			case 'right':
				moved = this.shiftRight();
				break;
			case 'down':
				moved = this.shiftDown();
				break;
		}

		if (moved) this.placeRandomNewTile();

		super.step(false);

		if (this.isBoardFull() && this.numMovesPossible() == 0)
			this.gameOver(
				{
					result: ResultType.LOSER,
					name: this.gameStarter.username,
					score: `${this.score}`,
				},
				interaction
			);
		else
			interaction
				.update(this.getContent())
				.catch((e) => super.handleError(e, 'update interaction'));
	}

	/**
	 * @public
	 * @param {import("discord.js").MessageReaction} reaction
	 * @returns {void}
	 */
	onReaction(reaction) {}
}
