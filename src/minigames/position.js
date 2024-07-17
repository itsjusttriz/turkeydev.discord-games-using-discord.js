import { Direction } from './direction';

/**
 * @typedef {Object} Position
 * @property {number} x - The x-coordinate.
 * @property {number} y - The y-coordinate.
 */

/**
 *
 * @param {Position} pos
 * @returns {Position}
 */
export const up = (pos) => ({ x: pos.x, y: pos.y - 1 });
/**
 *
 * @param {Position} pos
 * @returns {Position}
 */
export const down = (pos) => ({ x: pos.x, y: pos.y + 1 });
/**
 *
 * @param {Position} pos
 * @returns {Position}
 */
export const left = (pos) => ({ x: pos.x - 1, y: pos.y });
/**
 *
 * @param {Position} pos
 * @returns {Position}
 */
export const right = (pos) => ({ x: pos.x + 1, y: pos.y });

/**
 *
 * @param {Position} pos
 * @param {import('./direction.js').Direction} dir
 * @returns {Position}
 */
export const move = (pos, dir) => {
	switch (dir) {
		case Direction.UP:
			return up(pos);
		case Direction.DOWN:
			return down(pos);
		case Direction.LEFT:
			return left(pos);
		case Direction.RIGHT:
			return right(pos);
	}
};

/**
 *
 * @param {Position} pos1
 * @param {Position} pos2
 * @returns {boolean}
 */
export const posEqual = (pos1, pos2) => {
	return pos1.x === pos2.x && pos1.y === pos2.y;
};

/**
 *
 * @param {Position} pos
 * @param {number} width
 * @param {number} height
 * @returns {boolean}
 */
export const isInside = (pos, width, height) => {
	return pos.x >= 0 && pos.y >= 0 && pos.x < width && pos.y < height;
};

export default Position;
