// PM2 ecosystem for Sebco Travels backend.
// Loaded by `pm2 start ecosystem.config.cjs --env production`.
//
// NOTE on cluster mode + Socket.io:
// Socket.io rooms and in-memory dispatch timers do NOT cross processes.
// We default to a SINGLE process (fork mode) so the scaffold works out of the
// box with zero extra infrastructure.
//
// To scale across all CPU cores:
//   1. Install Redis on the same VM (`sudo apt install redis-server`).
//   2. Add REDIS_URL=redis://127.0.0.1:6379 to .env.
//   3. Change `instances` to "max" and `exec_mode` to "cluster" below.
// The code in src/realtime/io.js auto-attaches the Redis adapter when
// REDIS_URL is present, and src/services/dispatch.service.js can be swapped
// for a Redis-backed timeout queue.

module.exports = {
  apps: [
    {
      name: "sebco-travels-api",
      script: "src/server.js",
      cwd: __dirname,
      instances: 1,            // change to "max" once Redis adapter is enabled
      exec_mode: "fork",       // change to "cluster" once Redis adapter is enabled
      autorestart: true,
      watch: false,
      max_memory_restart: "512M",
      kill_timeout: 10000,     // give Socket.io time to flush on SIGINT
      wait_ready: true,
      listen_timeout: 15000,
      env: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      out_file: "logs/out.log",
      error_file: "logs/err.log",
      merge_logs: true,
      time: true,
    },
  ],
};
