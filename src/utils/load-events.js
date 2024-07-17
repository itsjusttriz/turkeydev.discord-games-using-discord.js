import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

/**
 * @param {import('discord.js').Client} client - Your Discord Client
 */
export const loadEvents = async (client) => {
	try {
		const eventsPath = path.resolve(process.cwd(), './src/events');
		const eventFiles = fs
			.readdirSync(eventsPath)
			.filter((file) => file.endsWith('.js'));

		for (const file of eventFiles) {
			const filePath = path.join(eventsPath, file);
			const convertedPath = pathToFileURL(filePath).href;
			const { default: event } = await import(convertedPath);
			if (event.once) {
				client.once(event.name, (...args) => event.execute(...args));
				continue;
			}

			client.on(event.name, (...args) => event.execute(...args));
		}
	} catch (error) {
		console.error(error);
	}
};
