import path from 'path';
import fs from 'fs';
import { pathToFileURL } from 'url';

/**
 * @typedef {import('discord.js').Client<true>} Client
 * @typedef {import('discord.js').Collection} Collection
 */

/**
 * @param {Client & {commands: Collection}} client - Your Discord Client
 */
export const loadCommands = async (client) => {
	try {
		const dirPath = path.join(process.cwd(), './src/commands');
		const commandFiles = fs
			.readdirSync(dirPath)
			.filter((file) => file.endsWith('.js'));

		for (const file of commandFiles) {
			const filePath = path.join(dirPath, file);
			const convertedPath = pathToFileURL(filePath).href;
			const { default: command } = await import(convertedPath);
			if ('data' in command && 'execute' in command) {
				client.commands.set(command.data.name, command);
				continue;
			}

			console.error(
				`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
			);
		}
	} catch (error) {
		console.error(error);
	}
};
