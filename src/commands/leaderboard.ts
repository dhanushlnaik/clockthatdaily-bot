import { SlashCommandBuilder, MessageFlags } from "discord.js";

import { api, type LeaderRow } from "../lib/api.js";
import { baseEmbed, links, COLOURS } from "../lib/theme.js";
import type { Command } from "./types.js";

const MEDALS = ["🥇", "🥈", "🥉"];

function table(rows: LeaderRow[], by: "aura" | "streak"): string {
  if (rows.length === 0) return "Nobody has played yet.";
  return rows
    .map((r, i) => {
      const rank = MEDALS[i] ?? `\`${String(i + 1).padStart(2)}\``;
      const figure =
        by === "aura"
          ? `**${r.totalAura.toLocaleString()}** Aura`
          : `**${r.currentStreak}**-day streak`;
      const aside = by === "aura" ? `${r.currentStreak}d streak` : `${r.totalAura.toLocaleString()} Aura`;
      return `${rank} **${r.username}** — ${figure} · ${aside}`;
    })
    .join("\n");
}

export const leaderboard: Command = {
  slow: true,
  data: new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Who is winning")
    .addStringOption((o) =>
      o
        .setName("by")
        .setDescription("Rank by total Aura or by current streak")
        .addChoices(
          { name: "Aura", value: "aura" },
          { name: "Streak", value: "streak" }
        )
    )
    .addBooleanOption((o) =>
      o.setName("private").setDescription("Show it only to you")
    ),

  async execute(interaction) {
    const by = (interaction.options.getString("by") ?? "aura") as "aura" | "streak";
    const rows = await api.leaderboard(by);

    const embed = baseEmbed(by === "aura" ? COLOURS.gold : COLOURS.brick)
      .setTitle(by === "aura" ? "The Chart · by Aura" : "The Chart · by streak")
      .setDescription(table(rows, by));

    await interaction.editReply({
      embeds: [embed],
      components: [links({ label: "Full chart", path: "/", emoji: "🏆" })]
    });
  }
};
