# ClockThatDaily — Discord bot

Slash commands for [clockthatdaily.com](https://clockthatdaily.com): today's
pressing, the arcade, the chart, and your own stats.

## How it fits together

The bot **does not touch the database**. The site's Postgres has twelve usable
connections shared with another service, and a second application holding its
own pool is what took the site down in August. Instead the bot calls a small
authenticated API on the website, which already owns a warm pooled connection:

```
Discord ──▶ bot (gateway) ──▶ clockthatdaily.com/api/bot/* ──▶ Postgres
```

Every route is gated by a shared secret (`BOT_API_SECRET`, compared in constant
time) and returns nothing that could spoil a puzzle — categories and counts,
never a title, a cluster grouping or a Needle answer.

`/profile` needs no linking step: signing into the site with Discord already
stores the account id, so anyone who logged in that way is findable.

## Running it

```bash
cp .env.example .env      # fill in the token, client id, guild id and secret
pnpm install
pnpm register             # register slash commands
pnpm dev                  # start the bot
```

`DISCORD_GUILD_ID` registers commands to one server, where they appear
instantly. Leave it blank to register globally — Discord caches those, so they
can take up to an hour.

`BOT_API_SECRET` must match the value in the website's environment.

## Hosting

This is a gateway bot, so it needs a process that stays running — Vercel will
not do. Anything that runs Node works: a small VPS, Railway, Fly, or a
`systemd` unit on the droplet.

```bash
pnpm build && pnpm start
```

## Commands

| Command | What it does |
| --- | --- |
| `/today` | Today's pressing, described without spoiling it |
| `/arcade` | The B-sides, and which have a puzzle today |
| `/leaderboard [by] [private]` | Top ten by Aura or by live streak |
| `/profile [player]` | Anyone's Aura, streak and today's result |

## Adding a command

Write it in `src/commands/`, export a `Command`, add it to the array in
`src/commands/index.ts`, then run `pnpm register`. Set `slow: true` if it calls
the site, and the router defers for you.
