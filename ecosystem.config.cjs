const path = require("node:path");

/**
 * PM2 config for the ClockThatDaily bot.
 *
 * `.cjs` rather than `.js` because package.json sets "type": "module" and PM2
 * reads this file with require().
 *
 * Paths are derived from __dirname rather than hardcoded, so this works
 * wherever the repo is cloned. The first version assumed /opt and failed with
 * "Script not found" on a server that used a different directory — and `cwd`
 * matters beyond tidiness, because config.ts loads .env relative to it.
 *
 * One instance, fork mode — deliberately. A Discord gateway bot holds a single
 * websocket identified by its token; running two would make Discord deliver
 * every interaction twice, and each process would try to answer, which shows up
 * as duplicate replies and "interaction already acknowledged" errors. Cluster
 * mode is for HTTP servers, not for this.
 */
module.exports = {
  apps: [
    {
      name: "ctd-bot",
      script: path.join(__dirname, "dist/index.js"),
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",

      autorestart: true,
      // Discord outages and network blips are normal; back off rather than
      // hammering the gateway, which can get a token rate limited.
      restart_delay: 5000,
      max_restarts: 20,
      min_uptime: "30s",

      env: { NODE_ENV: "production" },

      // Kept inside the app directory so no privileged mkdir is needed.
      out_file: path.join(__dirname, "logs/out.log"),
      error_file: path.join(__dirname, "logs/error.log"),
      merge_logs: true,
      time: true,

      watch: false
    }
  ]
};
