import { Events, MessageFlags, type Interaction } from "discord.js";

import { commands } from "../commands/index.js";
import { ApiError } from "../lib/api.js";
import { baseEmbed, COLOURS } from "../lib/theme.js";

/**
 * Routes every slash command, and owns the error story.
 *
 * Discord gives an interaction three seconds before it is dead, so anything
 * that touches the network defers first. After deferring, the only way to
 * speak is editReply — replying again throws, which is how a failed command
 * turns into "the application did not respond" and hides the real cause.
 */
export const name = Events.InteractionCreate;

export async function execute(interaction: Interaction): Promise<void> {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) {
    console.warn(`Unknown command: ${interaction.commandName}`);
    return;
  }

  const wantsPrivate = interaction.options.getBoolean("private") ?? false;

  try {
    if (command.slow) {
      await interaction.deferReply(
        wantsPrivate ? { flags: MessageFlags.Ephemeral } : {}
      );
    }
    await command.execute(interaction);
  } catch (error) {
    const friendly =
      error instanceof ApiError
        ? error.message
        : "Something went wrong on our side. Try again in a moment.";

    console.error(`/${interaction.commandName} failed:`, error);

    const embed = baseEmbed(COLOURS.brick).setTitle("Couldn't reach the press").setDescription(friendly);

    try {
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ embeds: [embed], components: [] });
      } else {
        await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
      }
    } catch (replyError) {
      // The interaction token has expired, or Discord is unhappy. Nothing left
      // to say to the user; make sure it reaches the logs.
      console.error("Could not deliver the error to the user:", replyError);
    }
  }
}
