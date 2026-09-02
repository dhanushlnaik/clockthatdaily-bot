/**
 * PM2 config for the ClockThatDaily bot.
 *
 * `.cjs` rather than `.js` because package.json sets "type": "module" and PM2
 * reads this file with require().
 *
 * One instance, fork mode — deliberately. A Discord gateway bot holds a single
 * websocket identified by its token; running two would make Discord deliver
 * every interaction twice and each process would try to answer, which shows up
 * as duplicate replies and "interaction already acknowledged" errors. Cluster
 * mode is for HTTP servers, not for this.
 */
module.exports = {
  apps: [
    {
      name: "ctd-bot",
      script: "dist/index.js",
      cwd: "/opt/clockthatdaily-bot",
      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      // Discord outages and network blips are normal; back off rather than
      // hammering the gateway, which can get a token rate limited.
      restart_delay: 5000,
      max_restarts: 20,
      min_uptime: "30s",

      env: { NODE_ENV: "production" },

      out_file: "/var/log/ctd-bot/out.log",
      error_file: "/var/log/ctd-bot/error.log",
      merge_logs: true,
      time: true,

      // The token and API secret live in .env next to the build. config.ts
      // loads it via process.loadEnvFile, so cwd above must be right.
      watch: false
    }
  ]
};
