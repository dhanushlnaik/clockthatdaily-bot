import { SlashCommandBuilder, MessageFlags } from "discord.js";

import { commands } from "./index.js";
import { baseEmbed, links, COLOURS } from "../lib/theme.js";
import type { Command } from "./types.js";

/**
 * What the bot can do.
 *
 * Reads the registry rather than repeating a list, so a new command documents
 * itself and this cannot fall out of date.
 *
 * Ephemeral: help is for the person who asked, not the channel.
 */
export const help: Command = {
  data: new SlashCommandBuilder().setName("help").setDescription("What this bot can do"),

  async execute(interaction) {
    const lines = [...commands.values()]
      .map((c) => `**/${c.data.name}** — ${c.data.description}`)
      .join("\n");

    await interaction.reply({
      flags: MessageFlags.Ephemeral,
      embeds: [
        baseEmbed(COLOURS.gold)
          .setTitle("ClockThatDaily")
          .setDescription(
            `${lines}\n\n**/play** — opens the Activity, where Needle and Chronology are playable inside Discord.`
          )
          .addFields({
            name: "Linking",
            value:
              "There is no linking step. Sign in on the site with Discord and `/profile`, `/share` and `/friends` find you automatically.",
            inline: false
          })
      ],
      components: [links({ label: "Play", path: "/", emoji: "💿" }, { label: "The Arcade", path: "/play", emoji: "🕹️" })]
    });
  }
};
