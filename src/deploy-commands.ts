import { REST, Routes } from "discord.js";

import { config, isDev } from "./config.js";
import { commands } from "./commands/index.js";
import { entryPointCommand } from "./entryPoint.js";

/**
 * Registers slash commands with Discord.
 *
 * Guild commands appear the moment this finishes, which is what you want while
 * building. Global commands are cached by Discord and can take up to an hour,
 * so they are for release only. Set DISCORD_GUILD_ID to choose.
 */
const rest = new REST().setToken(config.token);
const chat = commands.map((c) => c.data.toJSON());

// Ordinary commands go wherever we are pointed; the Activity launcher is
// application-wide and only exists on the global route.
if (isDev) {
  for (const guildId of config.guildIds) {
    try {
      const guild = (await rest.put(Routes.applicationGuildCommands(config.clientId, guildId), {
        body: chat
      })) as unknown[];
      console.log(`Registered ${guild.length} command(s) to guild ${guildId}:`);
      for (const c of commands.values()) console.log(`  /${c.data.name} — ${c.data.description}`);
    } catch (error) {
      // Almost always means the app is not in that guild — registering guild
      // commands requires it to have been invited there first.
      const status = (error as { status?: number }).status;
      console.error(
        `\nCould not register to guild ${guildId}${status ? ` (HTTP ${status})` : ""}.` +
          (status === 403 || status === 404
            ? "\n  The app is probably not in that server yet — invite it first."
            : "")
      );
    }
  }

  // A global PUT replaces everything global, so it carries the entry point
  // alone here — the chat commands already live on the guild route.
  await rest.put(Routes.applicationCommands(config.clientId), { body: [entryPointCommand] });
  console.log(`\nRegistered the Activity launcher globally: /${entryPointCommand.name}`);
} else {
  const all = [...chat, entryPointCommand];
  const registered = (await rest.put(Routes.applicationCommands(config.clientId), {
    body: all
  })) as unknown[];
  console.log(`Registered ${registered.length} command(s) globally:`);
  for (const c of commands.values()) console.log(`  /${c.data.name} — ${c.data.description}`);
  console.log(`  /${entryPointCommand.name} — launches the Activity`);
}

console.log("\nGlobal commands can take up to an hour to appear.");
