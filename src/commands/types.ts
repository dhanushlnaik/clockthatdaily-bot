import type {
  ChatInputCommandInteraction,
  SlashCommandOptionsOnlyBuilder,
  SlashCommandBuilder,
  SlashCommandSubcommandsOnlyBuilder
} from "discord.js";

/** Every command is this shape, so the registry and the router stay trivial. */
export interface Command {
  data:
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;
  /** True for anything that hits the site, so the router can defer first. */
  slow?: boolean;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
