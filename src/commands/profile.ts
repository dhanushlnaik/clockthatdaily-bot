import { SlashCommandBuilder } from "discord.js";

import { api } from "../lib/api.js";
import { baseEmbed, links, COLOURS } from "../lib/theme.js";
import type { Command } from "./types.js";

/**
 * Someone's ClockThatDaily profile, looked up by Discord id.
 *
 * No linking flow is needed: signing into the site with Discord already stores
 * the account id, so anyone who logs in that way is findable immediately.
 * Google-only accounts are not, which is what the unlinked branch explains.
 */
export const profile: Command = {
  slow: true,
  data: new SlashCommandBuilder()
    .setName("profile")
    .setDescription("Your ClockThatDaily stats, or someone else's")
    .addUserOption((o) =>
      o.setName("player").setDescription("Whose profile to show — defaults to you")
    ),

  async execute(interaction) {
    const target = interaction.options.getUser("player") ?? interaction.user;
    const p = await api.player(target.id);
    const isSelf = target.id === interaction.user.id;

    if (!p.linked) {
      await interaction.editReply({
        embeds: [
          baseEmbed(COLOURS.cocoa)
            .setTitle(isSelf ? "No account yet" : `${target.username} has no account`)
            .setDescription(
              isSelf
                ? "Sign in to ClockThatDaily with Discord and your stats will show up here — no linking step."
                : "They have not signed in with Discord, so there is nothing to show."
            )
        ],
        components: [links({ label: "Sign in", path: "/", emoji: "💿" })]
      });
      return;
    }

    const embed = baseEmbed(COLOURS.lime)
      .setTitle(`@${p.username}`)
      .setThumbnail(target.displayAvatarURL())
      .addFields(
        { name: "🔥 Aura", value: (p.totalAura ?? 0).toLocaleString(), inline: true },
        { name: "⚡ Streak", value: `${p.currentStreak ?? 0} days`, inline: true },
        { name: "🏔️ Best", value: `${p.maxStreak ?? 0} days`, inline: true },
        { name: "📅 Played", value: `${p.daysPlayed ?? 0} pressings`, inline: true },
        {
          name: "Today",
          value: p.playedToday ? `Done · +${p.todayAura ?? 0} Aura` : "Not yet",
          inline: true
        }
      );

    await interaction.editReply({
      embeds: [embed],
      components: [links({ label: "Open profile", path: `/u/${p.username}`, emoji: "👤" })]
    });
  }
};
