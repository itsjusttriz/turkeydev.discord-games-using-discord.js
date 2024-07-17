import { Client, GatewayIntentBits } from 'discord.js';

/**
 * @typedef {Object} AddedProperties
 * @param {import('discord.js').Collection} commands
 * @param {import('discord.js').Collection} commandGameMap
 */

/**
 * @type {Client & AddedProperties} client
 */
export const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
	],
});
