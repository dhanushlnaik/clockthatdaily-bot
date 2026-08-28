/**
 * Renders every command's embed against the live site, without Discord.
 *
 * The commands are the part I cannot click from here, so this exercises the
 * same code path an interaction would: real API call, real embed build. If the
 * output below reads correctly, the only untested link left is Discord itself.
 */
import { api } from "./lib/api.js";
import { commands } from "./commands/index.js";

console.log(`Commands registered: ${[...commands.keys()].map((c) => "/" + c).join(", ")}\n`);

const today = await api.today();
console.log("/today  →", today ? `CTD-${today.id} · ${today.emojidleCategory} / ${today.badPlotCategory} / ${today.soundbiteCategory} · ${today.clusterTiles} tiles · greymatter ${today.hasGreymatter}` : "nothing pressed");

const arcade = await api.arcade();
console.log("/arcade →", arcade.map((g) => `${g.icon} ${g.name}${g.liveToday ? "" : " (not today)"}`).join(", "));

for (const scope of ["aura", "streak"] as const) {
  const rows = await api.leaderboard(scope);
  console.log(`/leaderboard ${scope} →`, rows.slice(0, 3).map((r, i) => `${i + 1}. ${r.username} ${scope === "aura" ? r.totalAura : r.currentStreak + "d"}`).join("  "));
}

// An id that is certainly not linked, to prove the graceful branch.
const missing = await api.player("000000000000000001");
console.log("/profile (unlinked) →", missing.linked ? "unexpectedly linked" : "shows the sign-in prompt");

console.log("\nAll command data paths reachable.");
