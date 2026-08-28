import { SlashCommandBuilder } from "discord.js";

import { api } from "../lib/api.js";
import { baseEmbed, links, COLOURS } from "../lib/theme.js";
import type { Command } from "./types.js";

/** The B-sides at /play. */
export const arcade: Command = {
  slow: true,
  data: new SlashCommandBuilder()
    .setName("arcade")
    .setDescription("The other daily games — Chronology, Needle and friends"),

  async execute(interaction) {
    const games = await api.arcade();

    const embed = baseEmbed(COLOURS.violet)
      .setTitle("The Arcade")
      .setDescription(
        "The gauntlet is the A-side. These are the B-sides — one new puzzle each, every day."
      );

    if (games.length === 0) {
      embed.setDescription("Nothing pressed in the arcade today.");
    } else {
      for (const g of games) {
        embed.addFields({
          name: `${g.icon} ${g.name}`,
          value: `${g.tagline}${g.liveToday ? "" : "\n*Not pressed today.*"}`,
          inline: false
        });
      }
    }

    await interaction.editReply({
      embeds: [embed],
      components: [
        links(
          { label: "Open the arcade", path: "/play", emoji: "🕹️" },
          ...games.filter((g) => g.liveToday).map((g) => ({ label: g.name, path: `/play/${g.slug}` }))
        )
      ]
    });
  }
};
