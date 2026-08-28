import { Collection } from "discord.js";

import { today } from "./today.js";
import { arcade } from "./arcade.js";
import { leaderboard } from "./leaderboard.js";
import { profile } from "./profile.js";
import type { Command } from "./types.js";

export const commands = new Collection<string, Command>(
  [today, arcade, leaderboard, profile].map((c) => [c.data.name, c])
);

export type { Command };
