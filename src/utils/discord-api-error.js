export class DiscordAPIError {
	/**
	 * @public
	 * @type {number}
	 */
	code;

	/**
	 * @public
	 * @type {string}
	 */
	message;

	/**
	 * @public
	 * @type {any}
	 */
	errors;

	/**
	 * @public
	 * @type {string}
	 */
	method;

	/**
	 * @public
	 * @type {string}
	 */
	endpoint;

	/**
	 *
	 * @param {number} code
	 * @param {string} message
	 * @param {any} errors
	 * @param {string} method
	 * @param {string} endpoint
	 */
	constructor(code, message, errors, method, endpoint) {
		this.code = code;
		this.message = message;
		this.errors = errors;
		this.method = method;
		this.endpoint = endpoint;
	}
}
