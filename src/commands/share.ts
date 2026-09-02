import { SlashCommandBuilder, MessageFlags } from "discord.js";

import { api } from "../lib/api.js";
import { baseEmbed, links, COLOURS } from "../lib/theme.js";
import type { Command } from "./types.js";

/**
 * Post today's result into the channel.
 *
 * The share grid is the reason Wordle spread, and it only works if posting it
 * is easier than not. The card comes from the site so the emoji match what the
 * share modal produces — two implementations would drift the moment one moved.
 *
 * Not ephemeral by default: a result nobody else sees is not a share.
 */
export const share: Command = {
  slow: true,
  data: new SlashCommandBuilder()
    .setName("share")
    .setDescription("Post today's result")
    .addStringOption((o) =>
      o
        .setName("game")
        .setDescription("Which one — defaults to the daily gauntlet")
        .addChoices(
          { name: "Daily Gauntlet", value: "gauntlet" },
          { name: "Needle", value: "needle" },
          { name: "Chronology", value: "chronology" }
        )
    ),

  async execute(interaction) {
    const game = interaction.options.getString("game") ?? "gauntlet";
    const result = await api.share(interaction.user.id, game);

    if (result.linked === false) {
      await interaction.editReply({
        embeds: [
          baseEmbed(COLOURS.cocoa)
            .setTitle("No account yet")
            .setDescription(
              "Sign in to ClockThatDaily with Discord and your results will be shareable from here."
            )
        ],
        components: [links({ label: "Sign in", path: "/", emoji: "💿" })]
      });
      return;
    }

    if (!result.played) {
      await interaction.editReply({
        embeds: [
          baseEmbed(COLOURS.cocoa)
            .setTitle("Nothing to share yet")
            .setDescription("You haven't played that one today.")
        ],
        components: [links({ label: "Play now", path: game === "gauntlet" ? "/" : `/play/${game}`, emoji: "▶️" })]
      });
      return;
    }

    await interaction.editReply({
      embeds: [
        baseEmbed(COLOURS.lime)
          .setAuthor({
            name: `@${result.username}`,
            iconURL: interaction.user.displayAvatarURL()
          })
          .setDescription(`\`\`\`\n${result.card}\n\`\`\``)
          .addFields({ name: "Aura", value: String(result.aura ?? 0), inline: true })
      ],
      components: [
        links({ label: "Play it", path: game === "gauntlet" ? "/" : `/play/${game}`, emoji: "💿" })
      ]
    });
  }
};
