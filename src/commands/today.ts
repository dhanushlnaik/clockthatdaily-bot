import { SlashCommandBuilder } from "discord.js";

import { api } from "../lib/api.js";
import { baseEmbed, links, COLOURS, nextResetTimestamp } from "../lib/theme.js";
import type { Command } from "./types.js";

/**
 * Today's pressing, without spoiling it.
 *
 * Categories only — never a title, a cluster grouping or a Greymatter prompt.
 * The point is to make someone want to open the site, not to let them read the
 * puzzle in chat.
 */
export const today: Command = {
  slow: true,
  data: new SlashCommandBuilder()
    .setName("today")
    .setDescription("Today's pressing — four tracks and a bonus"),

  async execute(interaction) {
    const pressing = await api.today();

    if (!pressing) {
      await interaction.editReply({
        embeds: [
          baseEmbed(COLOURS.brick)
            .setTitle("Nothing pressed today")
            .setDescription(`The next pressing drops ${nextResetTimestamp()}.`)
        ]
      });
      return;
    }

    const embed = baseEmbed(COLOURS.gold)
      .setTitle(`CTD-${pressing.id} · Today's pressing`)
      .setDescription(
        pressing.triviaLore ??
          "Four tracks across cinema, gaming, anime and brainrot. Four minutes, if you are quick."
      )
      .addFields(
        { name: "🎬 Emojidle", value: pressing.emojidleCategory, inline: true },
        { name: "📜 Bad Plot", value: pressing.badPlotCategory, inline: true },
        { name: "🔊 Soundbite", value: pressing.soundbiteCategory, inline: true },
        {
          name: "🧩 Cluster",
          // Always four groups of four; the tile count is what varies in principle.
          value: `${pressing.clusterTiles} tiles, 4 secret groups`,
          inline: true
        },
        {
          name: "🧠 Greymatter",
          value: pressing.hasGreymatter ? "Bonus available · +150" : "None today",
          inline: true
        },
        { name: "⏱️ Next drop", value: nextResetTimestamp(), inline: true }
      );

    await interaction.editReply({
      embeds: [embed],
      components: [links({ label: "Play today's pressing", path: "/", emoji: "💿" })]
    });
  }
};
