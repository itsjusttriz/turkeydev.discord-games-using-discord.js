import { ButtonBuilder, EmbedBuilder } from 'discord.js';
import GameBase from '../utils/game-base.js';
import { DiscordButtonStyles } from '../utils/discord-button-styles.js';
import { ActionRowBuilder } from '@discordjs/builders';
import { ResultType } from '../utils/game-result.js';
import { down, isInside, left, right, up } from '../utils/position.js';

const WIDTH = 13;
const HEIGHT = 13;

const SQUARES = {
	red_square: '🟥',
	blue_square: '🟦',
	orange_square: '🟧',
	purple_square: '🟪',
	green_square: '🟩',
};

export default class FloodGame extends GameBase {
	/**
	 * @type {string[]}
	 */
	gameBoard;

	/**
	 * @type {number}
	 */
	turn;

	constructor() {
		super('flood', false);
		this.gameBoard = Array.from(
			{ length: WIDTH * HEIGHT },
			() =>
				Object.values(SQUARES)[
					Math.floor(Math.random() * Object.keys(SQUARES).length)
				]
		);
		this.turn = 1;
	}

	/**
	 * @private
	 * @returns {string}
	 */
	gameBoardToString() {
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
	 * @private
	 * @returns {EmbedBuilder}
	 */
	getBaseEmbed() {
		return new EmbedBuilder()
			.setColor('#08b9bf')
			.setTitle('Flood')
			.setAuthor({
				name: 'Made By: TurkeyDev',
				iconURL: 'https://site.theturkey.dev/images/turkey_avatar.png',
				url: 'https://www.youtube.com/watch?v=BCKoXy94PM4',
			})
			.setTimestamp();
	}

	/**
	 * @protected
	 * @returns {import('discord.js').MessageEditOptions}
	 */
	getContent() {
		const row = new ActionRowBuilder().addComponents(
			...Object.entries(SQUARES).map(([k, v]) =>
				new ButtonBuilder()
					.setStyle(DiscordButtonStyles.SECONDARY)
					.setCustomId(k)
					.setLabel(v)
			)
		);

		const embed = this.getBaseEmbed()
			.setDescription(this.gameBoardToString())
			.addFields({ name: 'Turn:', value: this.turn.toString() })
			.setFooter({
				text: `Currently Playing: ${this.gameStarter.username}`,
			});

		return {
			embeds: [embed],
			// @ts-ignore
			components: [row],
		};
	}

	/**
	 * @protected
	 * @param {import('../utils/game-result.js').GameResult} result
	 * @returns {import('discord.js').MessageEditOptions}
	 */
	getGameOverContent(result) {
		const turnResp =
			result.result == ResultType.WINNER
				? `Game beat in ${this.turn - 1} turns!`
				: '';

		return {
			embeds: [
				this.getBaseEmbed()
					.setDescription(`GAME OVER!\n${turnResp}`)
					.setFooter({
						text: `Player: ${this.gameStarter.username}}`,
					}),
			],
		};
	}

	/**
	 * @public
	 * @param {import('discord.js').ButtonInteraction} interaction
	 * @returns {void}
	 */
	onInteraction(interaction) {
		if (!interaction.isButton()) return;

		const selected = Object.entries(SQUARES).find(
			([k, v]) => k === interaction.customId
		);
		const current = this.gameBoard[0];

		if (selected && selected[1] !== current) {
			this.turn += 1;
			/**
			 * @type {import("../utils/position.js").Position[]}
			 */
			const queue = [{ x: 0, y: 0 }];
			/**
			 * @type {import("../utils/position.js").Position[]}
			 */
			const visited = [];

			while (queue.length > 0) {
				/**
				 * @type {import("../utils/position.js").Position|undefined}
				 */
				const pos = queue.shift();
				if (!pos || visited.some((p) => p.x === pos.x && p.y === pos.y))
					continue;

				visited.push(pos);
				if (this.gameBoard[pos.y * WIDTH + pos.x] === current) {
					this.gameBoard[pos.y * WIDTH + pos.x] = selected[1];

					[up(pos), down(pos), left(pos), right(pos)].forEach(
						(checkPos) => {
							if (
								!visited.some(
									(p) =>
										p.x === checkPos.x && p.y === checkPos.y
								) &&
								isInside(checkPos, WIDTH, HEIGHT)
							)
								queue.push(checkPos);
						}
					);
				}
			}

			const gameOver = !this.gameBoard.find((t) => t !== selected[1]);
			if (gameOver)
				this.gameOver(
					{
						result: ResultType.WINNER,
						score: (this.turn - 1).toString(),
					},
					interaction
				);
			else super.step(false);
		}

		if (this.isInGame())
			interaction
				.update(this.getContent())
				.catch((e) => super.handleError(e, 'update interaction'));
		else if (!this.result)
			this.gameOver({ result: ResultType.ERROR }, interaction);
	}

	/**
	 * @public
	 * @param {import("discord.js").MessageReaction} reaction
	 * @returns {void}
	 */
	onReaction(reaction) {}
}
