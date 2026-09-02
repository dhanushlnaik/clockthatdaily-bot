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

## Hosting on Ubuntu with PM2

A gateway bot needs a process that stays running, so Vercel will not do.

```bash
# once, on the server
sudo apt update && sudo apt install -y nodejs npm
sudo npm i -g pnpm pm2
# deploy — anywhere you like, the PM2 config follows the directory
mkdir -p ~/bot && cd ~/bot
git clone <this repo> clockthatdaily-bot && cd clockthatdaily-bot
cp .env.example .env             # then fill it in — see below
pnpm install
pnpm build
pnpm register                    # only when commands have changed

pm2 start ecosystem.config.cjs
pm2 save                         # remember the process list
pm2 startup                      # prints a command — run it, for boot survival
```

`.env` must contain `DISCORD_TOKEN`, `DISCORD_CLIENT_ID`, `BOT_API_SECRET`
(matching the website) and optionally `DISCORD_GUILD_ID`. It is loaded relative
to the working directory, which `ecosystem.config.cjs` sets to the repo root —
so keep `.env` beside `dist/`. Logs land in `logs/` in the same place.

### Day to day

```bash
pm2 logs ctd-bot          # follow output
pm2 restart ctd-bot       # after a deploy
pm2 status                # is it alive, how many restarts
```

### Updating

```bash
cd /opt/clockthatdaily-bot && git pull && pnpm install && pnpm build
pm2 restart ctd-bot
```

### One instance only

The config runs a single process in fork mode on purpose. A gateway bot holds
one websocket per token: run two and Discord delivers every interaction to
both, each tries to reply, and you get duplicate messages and "interaction has
already been acknowledged" errors. Never `pm2 scale` this.

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
