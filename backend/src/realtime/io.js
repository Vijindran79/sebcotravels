// Socket.io singleton + room helpers. When REDIS_URL is set the Redis adapter
// is attached so multiple PM2 workers share rooms/events.
import { Server as IOServer } from "socket.io";
import { env, allowedOrigins } from "../config/env.js";
import { logger } from "../config/logger.js";

let io = null;

export const passengerRoom = (userId) => `pax:${userId}`;
export const driverRoom = (driverId) => `drv:${driverId}`;
export const bookingRoom = (bookingId) => `bk:${bookingId}`;

export async function initIo(httpServer) {
  io = new IOServer(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
    pingInterval: 20_000,
    pingTimeout: 25_000,
    transports: ["websocket", "polling"],
  });

  if (env.REDIS_URL) {
    try {
      const [{ createAdapter }, { createClient }] = await Promise.all([
        import("@socket.io/redis-adapter"),
        import("redis"),
      ]);
      const pub = createClient({ url: env.REDIS_URL });
      const sub = pub.duplicate();
      await Promise.all([pub.connect(), sub.connect()]);
      io.adapter(createAdapter(pub, sub));
      logger.info("socket.io: redis adapter attached");
    } catch (err) {
      logger.error({ err }, "socket.io: failed to attach redis adapter; continuing in single-process mode");
    }
  }

  return io;
}

export function getIo() {
  if (!io) throw new Error("Socket.io not initialised");
  return io;
}

export function closeIo() {
  if (!io) return Promise.resolve();
  return new Promise((resolve) => io.close(() => resolve()));
}
