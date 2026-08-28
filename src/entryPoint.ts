import {
  ApplicationCommandType,
  ApplicationIntegrationType,
  EntryPointCommandHandlerType,
  InteractionContextType,
  type RESTPostAPIApplicationCommandsJSONBody
} from "discord.js";

/**
 * The command that launches the Activity.
 *
 * Enabling Activities is not enough on its own — Discord needs a Primary Entry
 * Point command before the Activity can be opened from anywhere, which is what
 * the "no commands registered to launch them" warning in the portal is about.
 *
 * `DiscordLaunchActivity` hands the launch to Discord, so there is nothing for
 * this bot to handle when it fires: no interaction listener, no reply. Choosing
 * `AppHandler` instead would make it our job to respond, which is only worth
 * doing if you want a custom message before the Activity opens.
 *
 * Entry point commands are application-wide, so this always goes to the global
 * route even while the ordinary commands are scoped to a test guild.
 *
 * No description: the API type omits it for this command type, and Discord
 * supplies its own launch copy.
 */
export const entryPointCommand: RESTPostAPIApplicationCommandsJSONBody = {
  name: "play",
  type: ApplicationCommandType.PrimaryEntryPoint,
  handler: EntryPointCommandHandlerType.DiscordLaunchActivity,
  integration_types: [
    ApplicationIntegrationType.GuildInstall,
    ApplicationIntegrationType.UserInstall
  ],
  contexts: [
    InteractionContextType.Guild,
    InteractionContextType.BotDM,
    InteractionContextType.PrivateChannel
  ]
};
