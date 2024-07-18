import { Client, Collection, GatewayIntentBits } from 'discord.js';

export class ExtendedClient extends Client {
	/**
	 * @type {Collection.<string, import("./types.js").Command>}
	 */
	commands = new Collection();
}

export const client = new ExtendedClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
	],
});
