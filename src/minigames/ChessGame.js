import {
	SelectMenuOptionBuilder,
	StringSelectMenuBuilder,
} from '@discordjs/builders';
import GameBase from '../utils/game-base.js';
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from 'discord.js';
import { DiscordButtonStyles } from '../utils/discord-button-styles.js';
import { ResultType } from '../utils/game-result.js';

/**
 * @typedef {Object} Move
 * @property {number} fx
 * @property {number} fy
 * @property {number} tx
 * @property {number} ty
 * @property {number} replaced
 */

/**
 * @typedef {Object} MoveCheck
 * @property {boolean} valid
 * @property {string} msg
 */

const BLACK_KING = 6;
const WHITE_KING = 16;

export default class ChessGame extends GameBase {
	/**
	 * @private
	 * @type {number[]}
	 */
	gameBoard = [];

	/**
	 * @private
	 * @type {Move[]}
	 */
	aiMoveStack = [];

	/**
	 * @private
	 * @type {Move}
	 */
	selectedMove = { fx: 0, fy: 0, tx: 0, ty: 0, replaced: -1 };

	/**
	 * @private
	 * @type {string}
	 */
	message = '\u200b';

	constructor() {
		super('chess', true);
	}

	/**
	 * @private
	 * @returns {string}
	 */
	getGameDesc() {
		return (
			'**Welcome to Chess!**\n' +
			'- To play simply use the reactions provided to first select your piece you want to move\n' +
			'- Next hit the check reaction\n' +
			'- Now select where you want that piece to be moved!\n' +
			'- To go back to the piece selection hit the back reaction!\n' +
			'- Hit the check reaction to confirm your movement!\n' +
			'- If the piece dose not move check below to possibly see why!\n' +
			'- You do play against an AI, however the AI is not particularly very smart!\n' +
			'- There is no castling and you must actually take the king to win!\n'
		);
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

		this.gameBoard = [
			2, 3, 4, 6, 5, 4, 3, 2, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
			0, 0, 11, 11, 11, 11, 11, 11, 11, 11, 12, 13, 14, 15, 16, 14, 13,
			12,
		];

		this.player1Turn = true;
		this.selectedMove = { fx: 0, fy: 0, tx: 0, ty: 0, replaced: -1 };
		this.message = '\u200b';

		super.newGame(interaction, player2, onGameEnd);
	}

	/**
	 * @private
	 * @param {boolean} to
	 * @returns {SelectMenuOptionBuilder[]}
	 */
	getLetterOptions(to) {
		return [0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
			new SelectMenuOptionBuilder({
				label: `${to ? 'To' : 'From'} ${String.fromCharCode(65 + i)}`,
				value: `${i}`,
			}).setDefault(
				(to ? this.selectedMove.tx : this.selectedMove.fx) === i
			)
		);
	}

	/**
	 * @private
	 * @param {boolean} to
	 * @returns {SelectMenuOptionBuilder[]}
	 */
	getNumberOptions(to) {
		return [0, 1, 2, 3, 4, 5, 6, 7].map((i) =>
			new SelectMenuOptionBuilder({
				label: `${to ? 'To' : 'From'} ${i + 1}`,
				value: `${i}`,
			}).setDefault(
				(to ? this.selectedMove.ty : this.selectedMove.fy) === i
			)
		);
	}

	/**
	 * @private
	 * @returns {EmbedBuilder}
	 */
	getBaseEmbed() {
		return new EmbedBuilder()
			.setColor('#d6b881')
			.setTitle('Chess')
			.setAuthor({
				name: 'Made By: TurkeyDev',
				iconURL: 'https://site.theturkey.dev/images/turkey_avatar.png',
				url: 'https://www.youtube.com/watch?v=yMg9tVZBSPw',
			})
			.setDescription(this.getGameDesc())
			.setImage(
				`https://api.theturkey.dev/discordgames/genchessboard?gb=${this.gameBoard.join(
					','
				)}&s1=${this.selectedMove.fx},${this.selectedMove.fy}&s2=${
					this.selectedMove.tx
				},${this.selectedMove.ty}`
			)
			.setTimestamp();
	}

	/**
	 * @protected
	 * @returns {import('discord.js').MessageEditOptions}
	 */
	getContent() {
		const row1 = new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder()
				.setPlaceholder('from_letter')
				.addOptions(...this.getLetterOptions(false))
		);
		const row2 = new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder()
				.setPlaceholder('from_number')
				.addOptions(...this.getNumberOptions(false))
		);
		const row3 = new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder()
				.setPlaceholder('to_letter')
				.addOptions(...this.getLetterOptions(true))
		);
		const row4 = new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder()
				.setPlaceholder('to_number')
				.addOptions(...this.getNumberOptions(true))
		);
		const row5 = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setStyle(DiscordButtonStyles.SECONDARY)
				.setCustomId('confirm')
				.setLabel('Confirm')
		);

		return {
			embeds: [
				this.getBaseEmbed()
					.setDescription(this.getGameDesc())
					.addFields(
						{ name: 'Turn:', value: this.getDisplayForTurn() },
						{ name: 'Message:', value: this.message }
					)
					.setFooter({
						text: `Currently Playing: ${this.gameStarter.username}`,
					}),
			],
			// @ts-ignore
			components: [row1, row2, row3, row4, row5],
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
					'GAME OVER! ' + this.getWinnerText(result)
				),
			],
		};
	}

	/**
	 * @private
	 * @returns {void}
	 */
	endTurn() {
		if (
			!this.gameBoard.includes(BLACK_KING) ||
			!this.gameBoard.includes(WHITE_KING)
		) {
			this.gameOver({
				result: ResultType.WINNER,
				name: this.getDisplayForTurn(),
				score: this.gameBoard.join(','),
			});
		}

		this.player1Turn = !this.player1Turn;

		if (!this.player1Turn && this.player2 == null && this.isInGame()) {
			this.makeBestMove();
			this.endTurn();
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
	 * @param {import('discord.js').ButtonInteraction|import("discord.js").SelectMenuInteraction} interaction
	 * @returns {void}
	 */
	onInteraction(interaction) {
		const id = interaction.customId;
		const val = interaction.isButton()
			? ''
			: interaction.values[0].toString();

		switch (id) {
			case 'confirm':
				// eslint-disable-next-line no-case-declarations
				const fromIndex =
					this.selectedMove.fy * 8 + this.selectedMove.fx;
				// eslint-disable-next-line no-case-declarations
				const fromPiece = this.gameBoard[fromIndex];
				// eslint-disable-next-line no-case-declarations
				const toIndex = this.selectedMove.ty * 8 + this.selectedMove.tx;
				if (
					(fromPiece >= 10 && this.player1Turn) ||
					(fromPiece > 0 && fromPiece < 10 && !this.player1Turn)
				) {
					this.message = '\u200b';
					const moveInfo = this.canPieceMoveTo(
						fromPiece,
						this.selectedMove
					);
					if (moveInfo.valid) {
						this.gameBoard[fromIndex] = 0;
						this.gameBoard[toIndex] = fromPiece;
						this.selectedMove = {
							fx: -1,
							fy: -1,
							tx: -1,
							ty: -1,
							replaced: -1,
						};
						this.endTurn();
					} else {
						this.message = moveInfo.msg;
					}
				} else if (fromPiece == 0) {
					this.message = 'There is no piece at that location!';
				} else {
					this.message = 'You cannot move that piece!';
				}
				break;
			case 'from_letter':
				this.selectedMove.fx = parseInt(val);
				break;
			case 'from_number':
				this.selectedMove.fy = parseInt(val);
				break;
			case 'to_letter':
				this.selectedMove.tx = parseInt(val);
				break;
			case 'to_number':
				this.selectedMove.ty = parseInt(val);
				break;
		}

		this.step(false);
		interaction
			.update(
				this.result
					? this.getGameOverContent(this.result)
					: this.getContent()
			)
			.catch((e) => super.handleError(e, 'update interaction'));
	}

	/**
	 * @private
	 * @param {number} piece
	 * @param {Move} selectedMove
	 * @returns {MoveCheck}
	 */
	canPieceMoveTo(piece, selectedMove) {
		const blackPiece = piece < 10;

		switch (piece % 10) {
			case 1:
				return this.checkPawnMove(blackPiece, selectedMove);
			case 2:
				return this.checkRookMove(blackPiece, selectedMove);
			case 3:
				return this.checkKnightMove(blackPiece, selectedMove);
			case 4:
				return this.checkBishopMove(blackPiece, selectedMove);
			case 5:
				// eslint-disable-next-line no-case-declarations
				const rookMove = this.checkRookMove(
					blackPiece,
					selectedMove,
					true
				);
				if (!rookMove.valid)
					return this.checkBishopMove(blackPiece, selectedMove, true);
				return rookMove;
			case 6:
				return this.checkKingMove(blackPiece, selectedMove);
		}
		return { valid: false, msg: 'Invalid Piece!' };
	}

	/**
	 * @private
	 * @param {boolean} blackPiece
	 * @param {Move} selectedMove
	 * @returns {MoveCheck}
	 */
	checkPawnMove(blackPiece, selectedMove) {
		const xDiff = selectedMove.fx - selectedMove.tx;
		const yDiff = selectedMove.fy - selectedMove.ty;
		const pieceAt = this.gameBoard[selectedMove.ty * 8 + selectedMove.tx];
		if (
			pieceAt != 0 &&
			((blackPiece && pieceAt < 10) || (!blackPiece && pieceAt > 10))
		)
			return { valid: false, msg: 'You already have a piece there!' };

		const pieceAtDiff =
			pieceAt != 0 &&
			((blackPiece && pieceAt > 10) || (!blackPiece && pieceAt < 10));

		if (Math.abs(xDiff) > 1) {
			return { valid: false, msg: 'A Pawn cannot move like that!' };
		} else if (xDiff == 0) {
			if (yDiff > 0 && !blackPiece) {
				const checkJump = this.checkJumps([
					{ x: selectedMove.fx, y: selectedMove.fy - 1 },
				]);
				if (checkJump.valid) {
					if (
						(yDiff == 2 && selectedMove.fy == 6) ||
						(yDiff == 1 && !pieceAtDiff)
					)
						return {
							valid: true,
							msg: 'A Pawn cannot top that position!',
						};
					return { valid: false, msg: '\u200b' };
				} else {
					return checkJump;
				}
			} else if (yDiff < 0 && blackPiece) {
				const checkJump = this.checkJumps([
					{ x: selectedMove.fx, y: selectedMove.fy + 1 },
				]);
				if (checkJump.valid) {
					if (
						(yDiff == -2 && selectedMove.fy == 1) ||
						(yDiff == -1 && !pieceAtDiff)
					)
						return {
							valid: true,
							msg: 'A Pawn cannot top that position!',
						};
					return { valid: false, msg: '\u200b' };
				} else {
					return checkJump;
				}
			} else {
				return {
					valid: false,
					msg: 'A Pawn cannot top that position!',
				};
			}
		} else {
			if (Math.abs(yDiff) == 1 && pieceAtDiff)
				return { valid: true, msg: '\u200b' };
			return { valid: false, msg: 'You cannot take that piece!' };
		}
	}

	/**
	 * @private
	 * @param {boolean} blackPiece
	 * @param {Move} selectedMove
	 * @param {boolean} isQueen
	 * @returns {MoveCheck}
	 */
	checkRookMove(blackPiece, selectedMove, isQueen = false) {
		const xDiff = selectedMove.fx - selectedMove.tx;
		const yDiff = selectedMove.fy - selectedMove.ty;
		const pieceAt = this.gameBoard[selectedMove.ty * 8 + selectedMove.tx];
		const pieceAtDiff =
			pieceAt == 0 ||
			(blackPiece && pieceAt > 10) ||
			(!blackPiece && pieceAt < 10);

		if (xDiff != 0 && yDiff == 0 && pieceAtDiff) {
			const betweenPos = [];
			const inc = -(xDiff / Math.abs(xDiff));
			for (let i = selectedMove.fx + inc; i != selectedMove.tx; i += inc)
				betweenPos.push({ x: i, y: selectedMove.fy });
			return this.checkJumps(betweenPos);
		} else if (yDiff != 0 && xDiff == 0 && pieceAtDiff) {
			const betweenPos = [];
			const inc = -(yDiff / Math.abs(yDiff));
			for (let i = selectedMove.fy + inc; i != selectedMove.ty; i += inc)
				betweenPos.push({ x: selectedMove.fx, y: i });
			return this.checkJumps(betweenPos);
		}
		return {
			valid: false,
			msg: `A ${isQueen ? 'Queen' : 'Rook'} cannot move like that`,
		};
	}

	/**
	 * @private
	 * @param {boolean} blackPiece
	 * @param {Move} selectedMove
	 * @returns {MoveCheck}
	 */
	checkKnightMove(blackPiece, selectedMove) {
		const xDiff = selectedMove.fx - selectedMove.tx;
		const yDiff = selectedMove.fy - selectedMove.ty;
		const pieceAt = this.gameBoard[selectedMove.ty * 8 + selectedMove.tx];
		const pieceAtDiff =
			pieceAt == 0 ||
			(blackPiece && pieceAt > 10) ||
			(!blackPiece && pieceAt < 10);
		if (Math.abs(xDiff) == 2 && Math.abs(yDiff) == 1 && pieceAtDiff)
			return { valid: true, msg: '\u200b' };
		else if (Math.abs(xDiff) == 1 && Math.abs(yDiff) == 2 && pieceAtDiff)
			return { valid: true, msg: '\u200b' };
		return { valid: false, msg: 'A Knight cannot move like that' };
	}

	/**
	 * @private
	 * @param {boolean} blackPiece
	 * @param {Move} selectedMove
	 * @param {boolean} isQueen
	 * @returns {MoveCheck}
	 */
	checkBishopMove(blackPiece, selectedMove, isQueen = false) {
		const xDiff = selectedMove.fx - selectedMove.tx;
		const yDiff = selectedMove.fy - selectedMove.ty;
		const pieceAt = this.gameBoard[selectedMove.ty * 8 + selectedMove.tx];
		const pieceAtDiff =
			pieceAt == 0 ||
			(blackPiece && pieceAt > 10) ||
			(!blackPiece && pieceAt < 10);

		if (Math.abs(xDiff) == Math.abs(yDiff) && pieceAtDiff) {
			const betweenPos = [];
			const incX = -(xDiff / Math.abs(xDiff));
			const incY = -(yDiff / Math.abs(yDiff));
			let j = selectedMove.fy + incY;
			for (
				let i = selectedMove.fx + incX;
				i != selectedMove.tx;
				i += incX
			) {
				betweenPos.push({ x: i, y: j });
				j += incY;
			}
			return this.checkJumps(betweenPos);
		}
		return {
			valid: false,
			msg: `A ${isQueen ? 'Queen' : 'Bishop'} cannot move like that`,
		};
	}

	/**
	 * @private
	 * @param {boolean} blackPiece
	 * @param {Move} selectedMove
	 * @returns {MoveCheck}
	 */
	checkKingMove(blackPiece, selectedMove) {
		const xDiff = selectedMove.fx - selectedMove.tx;
		const yDiff = selectedMove.fy - selectedMove.ty;
		const pieceAt = this.gameBoard[selectedMove.ty * 8 + selectedMove.tx];
		const pieceAtDiff =
			pieceAt == 0 ||
			(blackPiece && pieceAt > 10) ||
			(!blackPiece && pieceAt < 10);

		if (Math.abs(xDiff) <= 1 && Math.abs(yDiff) <= 1 && pieceAtDiff) {
			return { valid: true, msg: '\u200b' };
		}
		return { valid: false, msg: 'A King cannot move like that' };
	}

	/**
	 * @private
	 * @param {import("../utils/position.js").Position[]} positions
	 * @returns {MoveCheck}
	 */
	checkJumps(positions) {
		for (let i = 0; i < positions.length; i++)
			if (this.gameBoard[positions[i].y * 8 + positions[i].x] != 0)
				return {
					valid: false,
					msg:
						'Cannot jump over piece at ' +
						positions[i].x +
						', ' +
						positions[i].y,
				};
		return { valid: true, msg: '\u200b' };
	}

	/**
	 * This AI below is reworked from https://github.com/lhartikk/simple-chess-ai and is not my own original work
	 */

	/**
	 * @private
	 * @returns {void}
	 */
	makeBestMove() {
		const depth = 4;
		/**
		 * @type {Move}
		 */
		const bestMove = this.minimaxRoot(depth, true);
		this.gameBoard[bestMove.ty * 8 + bestMove.tx] =
			this.gameBoard[bestMove.fy * 8 + bestMove.fx];
		this.gameBoard[bestMove.fy * 8 + bestMove.fx] = 0;
	}

	/**
	 * @private
	 * @param {number} depth
	 * @param {boolean} isMaximizingPlayer
	 * @returns {Move}
	 */
	minimaxRoot(depth, isMaximizingPlayer) {
		/**
		 * @type {Move[]}
		 */
		const newGameMoves = this.getValidMoves();
		let bestMove = -9999;
		/**
		 * @type {Move}
		 */
		let bestMoveFound = { fx: 0, fy: 0, tx: 0, ty: 0, replaced: 0 };

		newGameMoves.forEach((gameMove) => {
			this.makeTempMove(gameMove);
			/**
			 * @type {number}
			 */
			const value = this.minimax(
				depth - 1,
				-10000,
				10000,
				!isMaximizingPlayer
			);
			this.undoTempMove();
			if (value >= bestMove) {
				bestMove = value;
				bestMoveFound = gameMove;
			}
		});
		return bestMoveFound;
	}

	/**
	 * @private
	 * @param {number} depth
	 * @param {number} alpha
	 * @param {number} beta
	 * @param {boolean} isMaximizingPlayer
	 * @returns {number}
	 */
	minimax(depth, alpha, beta, isMaximizingPlayer) {
		if (depth === 0) return -this.evaluateBoard();

		/**
		 * @type {Move[]}
		 */
		const newGameMoves = this.getValidMoves();

		/**
		 * @type {number}
		 */
		let bestMove = isMaximizingPlayer ? -9999 : 9999;
		newGameMoves.forEach((gameMove) => {
			this.makeTempMove(gameMove);

			if (isMaximizingPlayer) {
				bestMove = Math.max(
					bestMove,
					this.minimax(depth - 1, alpha, beta, !isMaximizingPlayer)
				);
				this.undoTempMove();
				alpha = Math.max(alpha, bestMove);
			} else {
				bestMove = Math.min(
					bestMove,
					this.minimax(depth - 1, alpha, beta, !isMaximizingPlayer)
				);
				this.undoTempMove();
				beta = Math.min(beta, bestMove);
			}

			if (beta <= alpha) return bestMove;
		});
		return bestMove;
	}

	/**
	 * @private
	 * @returns {number}
	 */
	evaluateBoard() {
		let totalEvaluation = 0;
		for (let x = 0; x < 8; x++)
			for (let y = 0; y < 8; y++)
				totalEvaluation =
					totalEvaluation +
					this.getPieceValue(this.gameBoard[y * 8 + x], x, y);
		return totalEvaluation;
	}

	/**
	 * @private
	 * @param {number} piece
	 * @param {number} x
	 * @param {number} y
	 * @returns {number}
	 */
	getPieceValue(piece, x, y) {
		if (piece == 0) return 0;

		const absoluteValue = this.getAbsoluteValue(piece, piece < 10, x, y);
		return piece < 10 ? absoluteValue : -absoluteValue;
	}

	/**
	 * @private
	 * @param {number} piece
	 * @param {boolean} isWhite
	 * @param {number} x
	 * @param {number} y
	 * @returns {number}
	 */
	getAbsoluteValue(piece, isWhite, x, y) {
		switch (piece % 10) {
			case 1:
				return (
					10 + (isWhite ? pawnEvalWhite[y][x] : pawnEvalBlack[y][x])
				);
			case 2:
				return (
					50 + (isWhite ? rookEvalWhite[y][x] : rookEvalBlack[y][x])
				);
			case 3:
				return 30 + knightEval[y][x];
			case 4:
				return (
					30 +
					(isWhite ? bishopEvalWhite[y][x] : bishopEvalBlack[y][x])
				);
			case 5:
				return 90 + evalQueen[y][x];
			case 6:
				return (
					900 + (isWhite ? kingEvalWhite[y][x] : kingEvalBlack[y][x])
				);
			default:
				throw 'Unknown piece type: ' + piece;
		}
	}

	/**
	 * @private
	 * @returns {Move[]}
	 */
	getValidMoves() {
		/**
		 * @type {Move[]}
		 */
		const validMoves = [];
		for (let x = 0; x < 8; x++) {
			for (let y = 0; y < 8; y++) {
				const piece = this.gameBoard[y * 8 + x];
				if (piece != 0 && piece < 10) {
					for (let tx = 0; tx < 8; tx++) {
						for (let ty = 0; ty < 8; ty++) {
							/**
							 * @type {Move}
							 */
							const move = {
								fx: x,
								fy: y,
								tx: tx,
								ty: ty,
								replaced: -1,
							};
							if (this.canPieceMoveTo(piece, move).valid) {
								validMoves.push(move);
							}
						}
					}
				}
			}
		}
		return validMoves;
	}

	/**
	 * @private
	 * @param {Move} move
	 * @returns {void}
	 */
	makeTempMove(move) {
		move.replaced = this.gameBoard[move.ty * 8 + move.tx];
		this.aiMoveStack.push(move);
		const piece = this.gameBoard[move.fy * 8 + move.fx];
		this.gameBoard[move.fy * 8 + move.fx] = 0;
		this.gameBoard[move.ty * 8 + move.tx] = piece;
	}

	/**
	 * @private
	 * @returns {void}
	 */
	undoTempMove() {
		const move = this.aiMoveStack.pop();
		if (move !== undefined) {
			this.gameBoard[move.fy * 8 + move.fx] =
				this.gameBoard[move.ty * 8 + move.tx];
			this.gameBoard[move.ty * 8 + move.tx] = move.replaced;
		}
	}

	/**
	 * @private
	 * @returns {string}
	 */
	getDisplayForTurn() {
		return this.player1Turn
			? this.gameStarter.username
			: this.player2
			? this.player2?.username ?? 'ERR'
			: 'CPU';
	}
}

/**
 * @type {number[][]}
 */
const pawnEvalWhite = [
	[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
	[5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0, 5.0],
	[1.0, 1.0, 2.0, 3.0, 3.0, 2.0, 1.0, 1.0],
	[0.5, 0.5, 1.0, 2.5, 2.5, 1.0, 0.5, 0.5],
	[0.0, 0.0, 0.0, 2.0, 2.0, 0.0, 0.0, 0.0],
	[0.5, -0.5, -1.0, 0.0, 0.0, -1.0, -0.5, 0.5],
	[0.5, 1.0, 1.0, -2.0, -2.0, 1.0, 1.0, 0.5],
	[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
];

/**
 * @type {number[][]}
 */
const pawnEvalBlack = pawnEvalWhite.slice().reverse();

/**
 * @type {number[][]}
 */
const knightEval = [
	[-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
	[-4.0, -2.0, 0.0, 0.0, 0.0, 0.0, -2.0, -4.0],
	[-3.0, 0.0, 1.0, 1.5, 1.5, 1.0, 0.0, -3.0],
	[-3.0, 0.5, 1.5, 2.0, 2.0, 1.5, 0.5, -3.0],
	[-3.0, 0.0, 1.5, 2.0, 2.0, 1.5, 0.0, -3.0],
	[-3.0, 0.5, 1.0, 1.5, 1.5, 1.0, 0.5, -3.0],
	[-4.0, -2.0, 0.0, 0.5, 0.5, 0.0, -2.0, -4.0],
	[-5.0, -4.0, -3.0, -3.0, -3.0, -3.0, -4.0, -5.0],
];

/**
 * @type {number[][]}
 */
const bishopEvalWhite = [
	[-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
	[-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
	[-1.0, 0.0, 0.5, 1.0, 1.0, 0.5, 0.0, -1.0],
	[-1.0, 0.5, 0.5, 1.0, 1.0, 0.5, 0.5, -1.0],
	[-1.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, -1.0],
	[-1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0],
	[-1.0, 0.5, 0.0, 0.0, 0.0, 0.0, 0.5, -1.0],
	[-2.0, -1.0, -1.0, -1.0, -1.0, -1.0, -1.0, -2.0],
];

/**
 * @type {number[][]}
 */
const bishopEvalBlack = bishopEvalWhite.slice().reverse();

/**
 * @type {number[][]}
 */
const rookEvalWhite = [
	[0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0],
	[0.5, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[-0.5, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.5],
	[0.0, 0.0, 0.0, 0.5, 0.5, 0.0, 0.0, 0.0],
];

/**
 * @type {number[][]}
 */
const rookEvalBlack = rookEvalWhite.slice().reverse();

/**
 * @type {number[][]}
 */
const evalQueen = [
	[-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
	[-1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -1.0],
	[-1.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
	[-0.5, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
	[0.0, 0.0, 0.5, 0.5, 0.5, 0.5, 0.0, -0.5],
	[-1.0, 0.5, 0.5, 0.5, 0.5, 0.5, 0.0, -1.0],
	[-1.0, 0.0, 0.5, 0.0, 0.0, 0.0, 0.0, -1.0],
	[-2.0, -1.0, -1.0, -0.5, -0.5, -1.0, -1.0, -2.0],
];

/**
 * @type {number[][]}
 */
const kingEvalWhite = [
	[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[-3.0, -4.0, -4.0, -5.0, -5.0, -4.0, -4.0, -3.0],
	[-2.0, -3.0, -3.0, -4.0, -4.0, -3.0, -3.0, -2.0],
	[-1.0, -2.0, -2.0, -2.0, -2.0, -2.0, -2.0, -1.0],
	[2.0, 2.0, 0.0, 0.0, 0.0, 0.0, 2.0, 2.0],
	[2.0, 3.0, 1.0, 0.0, 0.0, 1.0, 3.0, 2.0],
];

/**
 * @type {number[][]}
 */
const kingEvalBlack = kingEvalWhite.slice().reverse();
