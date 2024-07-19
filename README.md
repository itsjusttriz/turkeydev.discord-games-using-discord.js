# Discord Games using Discord.js

This is a Javascript rewrite of [TurkeyDev's "Discord Games Bot"](https://github.com/TheTurkeyDev/Discord-Games) using **v14.15.3** of [discord.js](https://www.npmjs.com/package/discord.js).

This bot was written using "dynamic command handling" as some people were having issues integrating the logic into pre-existing bots.

This bot is written to be used in any **ONE** server, at a time, unlike Turkey's original Gamesbot, which can be invited to multiple servers.

**All credit goes to [TurkeyDev](https://github.com/TheTurkeyDev) on the logic behind the minigames.**
I've merely just converted it from Typescript back into Javascript, and made it use the "dynamic command handling" strategy that is used by many.

If you enjoy the content from the minigames and would like to support the original developer, head to their [Support Page](https://github.com/sponsors/TheTurkeyDev).

If you have any issues using this code, head to [TurkeyDev's Discord](https://discord.gg/DkexpJj)

## Required Scopes/Permissions

When creating your bot's invite link, you will need to enable the following permissions/scopes for the Invite URL:

### Scopes

-   `bot`
-   `applications.commands`

### Permissions

-   `Read Messages/View Channels`
-   `Send Messages`
-   `Manage Messages`
-   `Embed Links`
-   `Read Message History`
-   `Add Reactions`
-   `Use Slash Commands`

## Known Bugs

-   embed doesn't show. super.isInGame() is false.
    -   Chess
    -   Minesweeper
-   GameOver doesnt remove game from embed.
    -   Connect4
-   Action rows not being removed on GameOver.
    -   Snake
    -   Connect4
