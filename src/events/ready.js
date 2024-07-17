import { Events } from 'discord.js';
import { loadCommands } from '../utils/load-commands.js';
import { registerCommandsToDiscord } from '../utils/register-commands.js';

export default {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		await loadCommands(client);
		await registerCommandsToDiscord({
			token: process.env.DISCORD_TOKEN,
			clientId: process.env.APP_ID,
			guildId: process.env.GUILD_ID,
			commands: Array.from(client.commands.values()).map((cmd) =>
				cmd.data.toJSON()
			),
		});

		console.log(`Ready! Logged in as ${client.user.username}`);
		client.user.setActivity('!gbhelp');
	},
};
