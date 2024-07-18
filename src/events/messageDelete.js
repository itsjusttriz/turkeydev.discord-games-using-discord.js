import { Events } from 'discord.js';
import { handleMessageDelete } from '../utils/handle-message-delete.js';

/**
 * @typedef {import('discord.js').Message} Message
 */

export default {
	name: Events.MessageDelete,
	once: false,

	/**
	 *
	 * @param {Message} message
	 */
	async execute(message) {
		handleMessageDelete(message.guild?.id, message.id);
	},
};
