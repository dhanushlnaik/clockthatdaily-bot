import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

import { config } from "../config.js";

/**
 * The pressing-plant look, in Discord's vocabulary.
 *
 * Colours lifted from the site's palette so an embed reads as ClockThatDaily
 * rather than as a generic bot.
 */
export const COLOURS = {
  brick: 0xb4462f,
  gold: 0xe8b93a,
  lime: 0x8bc53f,
  cyan: 0x4ec3d9,
  violet: 0x7c5cff,
  cocoa: 0x2b211c
} as const;

export const FOOTER = "ClockThatDaily · Pressing Co.";

export function baseEmbed(colour: number = COLOURS.gold): EmbedBuilder {
  return new EmbedBuilder().setColor(colour).setFooter({ text: FOOTER }).setTimestamp();
}

/** A row of link buttons. Link buttons need no interaction handler. */
export function links(...items: { label: string; path: string; emoji?: string }[]) {
  const row = new ActionRowBuilder<ButtonBuilder>();
  for (const item of items) {
    const button = new ButtonBuilder()
      .setStyle(ButtonStyle.Link)
      .setLabel(item.label)
      .setURL(`${config.siteUrl}${item.path}`);
    if (item.emoji) button.setEmoji(item.emoji);
    row.addComponents(button);
  }
  return row;
}

/** 00:00 IST, rendered as a Discord timestamp so everyone sees their own clock. */
export function nextResetTimestamp(): string {
  const now = new Date();
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffsetMs);
  const nextIstMidnight = Date.UTC(
    ist.getUTCFullYear(),
    ist.getUTCMonth(),
    ist.getUTCDate() + 1
  );
  const utcMs = nextIstMidnight - istOffsetMs;
  return `<t:${Math.floor(utcMs / 1000)}:R>`;
}
