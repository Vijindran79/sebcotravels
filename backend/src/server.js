// HTTP + Socket.io entry. Starts MongoDB, builds the Express app, attaches
// Socket.io to the same HTTP server, and handles graceful shutdown.
import http from "node:http";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectDb, disconnectDb } from "./config/db.js";
import { buildApp } from "./app.js";
import { initIo, closeIo } from "./realtime/io.js";
import { socketAuth } from "./realtime/auth.js";
import { registerSocketHandlers } from "./realtime/handlers.js";

async function main() {
  await connectDb();

  const app = buildApp();
  const server = http.createServer(app);

  const io = await initIo(server);
  io.use(socketAuth);
  registerSocketHandlers(io);

  await new Promise((resolve) => server.listen(env.PORT, resolve));
  logger.info({ port: env.PORT, env: env.NODE_ENV }, "sebco-travels-api: listening");

  // Tell PM2 we are ready (ecosystem.config.cjs sets wait_ready: true).
  if (typeof process.send === "function") process.send("ready");

  const shutdown = async (signal) => {
    logger.info({ signal }, "sebco-travels-api: shutting down");
    try {
      await closeIo();
      await new Promise((resolve, reject) =>
        server.close((err) => (err ? reject(err) : resolve()))
      );
      await disconnectDb();
      logger.info("sebco-travels-api: stopped cleanly");
      process.exit(0);
    } catch (err) {
      logger.error({ err }, "sebco-travels-api: shutdown failed");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("unhandledRejection", (reason) =>
    logger.error({ reason }, "unhandledRejection")
  );
  process.on("uncaughtException", (err) => {
    logger.fatal({ err }, "uncaughtException");
    shutdown("uncaughtException");
  });
}

main().catch((err) => {
  logger.fatal({ err }, "sebco-travels-api: failed to start");
  process.exit(1);
});
