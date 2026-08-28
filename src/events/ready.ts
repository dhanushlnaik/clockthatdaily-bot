import { Events, ActivityType, type Client } from "discord.js";

export const name = Events.ClientReady;
export const once = true;

export function execute(client: Client<true>): void {
  console.log(`Logged in as ${client.user.tag} — serving ${client.guilds.cache.size} guild(s).`);
  client.user.setPresence({
    activities: [{ name: "the daily pressing", type: ActivityType.Playing }],
    status: "online"
  });
}
