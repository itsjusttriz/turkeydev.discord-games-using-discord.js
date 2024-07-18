import SnakeGame from '../minigames/SnakeGame.js';
import HangmanGame from '../minigames/HangmanGame.js';
import Connect4Game from '../minigames/Connect4Game.js';
import MinesweeperGame from '../minigames/MinesweeperGame.js';
import ChessGame from '../minigames/ChessGame.js';
import TicTacToeGame from '../minigames/TicTacToeGame.js';
import FloodGame from '../minigames/FloodGame.js';
import TwentyFortyEightGame from '../minigames/TwentyFortyEightGame.js';

/**
 * @typedef {Object.<string, function(): import("./game-base.js").default>} GameCommandMap
 */

/**
 * @type {GameCommandMap}
 */
export const commandGameMap = {
	snake: () => new SnakeGame(),
	hangman: () => new HangmanGame(),
	connect4: () => new Connect4Game(),
	minesweeper: () => new MinesweeperGame(),
	chess: () => new ChessGame(),
	tictactoe: () => new TicTacToeGame(),
	flood: () => new FloodGame(),
	2048: () => new TwentyFortyEightGame(),
};
