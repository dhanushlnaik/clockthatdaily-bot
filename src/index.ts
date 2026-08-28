import { Client, GatewayIntentBits } from "discord.js";

import { config } from "./config.js";
import * as ready from "./events/ready.js";
import * as interactionCreate from "./events/interactionCreate.js";

/**
 * Guilds is the only intent needed.
 *
 * Slash commands arrive as interactions, not messages, so the bot never asks
 * for MessageContent — a privileged intent that would need review and would be
 * asking for far more than this bot does.
 */
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(ready.name, ready.execute);
client.on(interactionCreate.name, interactionCreate.execute);

client.on("error", (error) => console.error("Client error:", error));
process.on("unhandledRejection", (reason) => console.error("Unhandled rejection:", reason));

// Leaving the gateway connection open on exit makes the bot look online for
// several minutes after it has stopped answering.
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => {
    console.log(`\n${signal} — closing the gateway connection.`);
    void client.destroy().finally(() => process.exit(0));
  });
}

await client.login(config.token);
