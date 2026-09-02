import { config } from "../config.js";

/**
 * Typed client for the bot-only API on clockthatdaily.com.
 *
 * The bot deliberately does not talk to Postgres. The database has twelve
 * usable connections shared with another service, and a second application
 * holding its own pool is exactly the exhaustion that took the site down in
 * August. The website already owns a warm, pooled connection — so the bot asks
 * it, and gets caching for free.
 *
 * Every route is authenticated with a shared secret and returns nothing that
 * could spoil a puzzle: no answers, no cluster groupings, no Needle words.
 */

export interface TodayPressing {
  id: string;
  date: string;
  dayNumber: number;
  emojidleCategory: string;
  badPlotCategory: string;
  soundbiteCategory: string;
  clusterTiles: number;
  hasGreymatter: boolean;
  triviaLore: string | null;
}

export interface ArcadeGame {
  slug: string;
  name: string;
  tagline: string;
  icon: string;
  liveToday: boolean;
}

export interface LeaderRow {
  username: string;
  totalAura: number;
  currentStreak: number;
  maxStreak: number;
  daysPlayed: number;
}

export interface PlayerProfile {
  linked: boolean;
  username?: string;
  totalAura?: number;
  currentStreak?: number;
  maxStreak?: number;
  daysPlayed?: number;
  playedToday?: boolean;
  todayAura?: number;
}

export interface ShareResult {
  linked?: boolean;
  played: boolean;
  username?: string;
  aura?: number;
  card?: string;
}

export interface FriendsBoard {
  linked: boolean;
  rows: { username: string; totalAura: number; currentStreak: number; isYou: boolean }[];
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function get<T>(path: string): Promise<T> {
  const url = `${config.siteUrl}/api/bot${path}`;
  let res: Response;
  try {
    res = await fetch(url, {
      headers: { "x-bot-secret": config.apiSecret, accept: "application/json" },
      // Every command that calls this defers first, which buys fifteen minutes
      // rather than three seconds — so the budget is set by how long a cold
      // serverless function actually takes (measured at up to 3.6s), not by
      // the interaction deadline. A 2.2s budget failed on the first cold call.
      signal: AbortSignal.timeout(10_000)
    });
  } catch (cause) {
    throw new ApiError(
      cause instanceof Error && cause.name === "TimeoutError"
        ? "The pressing plant took too long to answer."
        : "Could not reach the pressing plant.",
      0
    );
  }

  if (res.status === 401) throw new ApiError("The bot is not authorised. Check BOT_API_SECRET.", 401);
  if (!res.ok) throw new ApiError(`The site answered ${res.status}.`, res.status);

  return (await res.json()) as T;
}

export const api = {
  today: () => get<TodayPressing | null>("/today"),
  arcade: () => get<ArcadeGame[]>("/arcade"),
  leaderboard: (scope: "aura" | "streak") => get<LeaderRow[]>(`/leaderboard?scope=${scope}`),
  /** Looked up by Discord account id — the site already stores it from OAuth. */
  player: (discordId: string) => get<PlayerProfile>(`/player/${discordId}`),
  share: (discordId: string, game: string) =>
    get<ShareResult>(`/share/${discordId}?game=${encodeURIComponent(game)}`),
  friends: (discordId: string) => get<FriendsBoard>(`/friends/${discordId}`)
};
