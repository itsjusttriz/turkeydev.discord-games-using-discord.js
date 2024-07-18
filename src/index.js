import { Collection } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';

// Setup .env file loading, if necessary.
dotenv.config({ path: path.resolve(process.cwd(), './.env') });

import { client } from './utils/client.js';
import { loadEvents } from './utils/load-events.js';

(async () => {
	await loadEvents(client);

	// Connect your client to Discord.
	client.login(process.env.DISCORD_TOKEN);
})();
