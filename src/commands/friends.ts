import { SlashCommandBuilder } from "discord.js";

import { api } from "../lib/api.js";
import { baseEmbed, links, COLOURS } from "../lib/theme.js";
import type { Command } from "./types.js";

/** Your friends board from the site, ranked by Aura. */
export const friends: Command = {
  slow: true,
  data: new SlashCommandBuilder()
    .setName("friends")
    .setDescription("Your friends board on ClockThatDaily"),

  async execute(interaction) {
    const board = await api.friends(interaction.user.id);

    if (!board.linked) {
      await interaction.editReply({
        embeds: [
          baseEmbed(COLOURS.cocoa)
            .setTitle("No account yet")
            .setDescription("Sign in with Discord on the site and add a few friends first.")
        ],
        components: [links({ label: "Sign in", path: "/", emoji: "💿" })]
      });
      return;
    }

    if (board.rows.length <= 1) {
      await interaction.editReply({
        embeds: [
          baseEmbed(COLOURS.cocoa)
            .setTitle("No friends added yet")
            .setDescription("Add people from your profile on the site and they'll show up here.")
        ],
        components: [links({ label: "Find friends", path: "/", emoji: "👥" })]
      });
      return;
    }

    await interaction.editReply({
      embeds: [
        baseEmbed(COLOURS.violet)
          .setTitle("Your friends")
          .setDescription(
            board.rows
              .map(
                (r, i) =>
                  `\`${String(i + 1).padStart(2)}\` ${r.isYou ? "**" : ""}${r.username}${r.isYou ? "** (you)" : ""} — ${r.totalAura.toLocaleString()} Aura · ${r.currentStreak}d`
              )
              .join("\n")
          )
      ]
    });
  }
};
