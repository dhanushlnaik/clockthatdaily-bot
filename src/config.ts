import { existsSync } from "node:fs";

/**
 * Loads .env before anything reads it.
 *
 * Done here rather than relying on the runner passing --env-file, because
 * forgetting that flag produces "Missing DISCORD_TOKEN" pointing at a file that
 * exists and is correct — which is a confusing way to spend ten minutes.
 * Anything already in the real environment wins, so hosting platforms that
 * inject variables directly are unaffected.
 */
if (existsSync(".env")) {
  try {
    process.loadEnvFile(".env");
  } catch {
    // Malformed or unreadable; the checks below will say what is missing.
  }
}

/**
 * Environment, validated once at boot.
 *
 * A bot that starts with a missing token fails later, inside an interaction,
 * where the user sees "the application did not respond" and the cause is three
 * layers down. Failing here instead makes the error the first thing you read.
 */

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    const hint = existsSync(".env")
      ? `.env exists but has no ${name} — check the spelling and that it is not commented out.`
      : "Copy .env.example to .env and fill it in — see the README.";
    throw new Error(`Missing ${name}. ${hint}`);
  }
  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name]?.trim() || fallback;
}

export const config = {
  token: required("DISCORD_TOKEN"),
  clientId: required("DISCORD_CLIENT_ID"),
  /** Set while developing: guild commands appear instantly, global ones cache. */
  guildId: optional("DISCORD_GUILD_ID"),
  siteUrl: optional("SITE_URL", "https://clockthatdaily.com").replace(/\/$/, ""),
  apiSecret: optional("BOT_API_SECRET")
} as const;

export const isDev = Boolean(config.guildId);
