import { Collection } from "discord.js";

import { today } from "./today.js";
import { arcade } from "./arcade.js";
import { leaderboard } from "./leaderboard.js";
import { profile } from "./profile.js";
import { share } from "./share.js";
import { friends } from "./friends.js";
import { help } from "./help.js";
import type { Command } from "./types.js";

export const commands = new Collection<string, Command>(
  [today, arcade, leaderboard, profile, share, friends, help].map((c) => [c.data.name, c])
);

export type { Command };
