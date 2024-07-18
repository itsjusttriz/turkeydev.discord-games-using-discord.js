/**
 * @typedef {import('discord.js').CommandInteraction} CommandInteraction
 * @typedef {import('discord.js').CacheType} CacheType
 */

/**
 * @typedef {Object} CommandData
 * @property {string} name - The name of the command.
 * @property {string} description - The description of the command.
 */

/**
 * @callback CommandExecuteFunction
 * @param {CommandInteraction} interaction - The command interaction
 * @returns {Promise<void>|void}
 */

/**
 * Represents a command in the bot.
 * @typedef {Object} Command
 * @property {CommandData} data - The command data.
 * @property {CommandExecuteFunction} execute - The function to execute the command.
 */

export {};
