import { Events } from 'discord.js';
import { handleMessageDelete } from '../utils/handle-message-delete.js';

/**
 * @typedef {import('discord.js').Message[]} Messages
 */

export default {
	name: Events.MessageBulkDelete,
	once: false,

	/**
	 *
	 * @param {Messages} messages
	 */
	async execute(messages) {
		messages.forEach((m) => handleMessageDelete(m.guild?.id, m.id));
	},
};
