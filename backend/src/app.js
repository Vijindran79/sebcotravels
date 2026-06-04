import express from "express";
import "express-async-errors";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import pinoHttp from "pino-http";

import { env, allowedOrigins } from "./config/env.js";
import { logger } from "./config/logger.js";
import { notFound, errorHandler } from "./middleware/error.js";
import apiRoutes from "./routes/index.js";
import webhookRoutes from "./routes/webhooks.routes.js";

export function buildApp() {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  );
  app.use(pinoHttp({ logger }));

  // Stripe webhook MUST run before the JSON parser so the raw bytes are
  // preserved for signature verification.
  app.use("/api/webhooks", express.raw({ type: "application/json" }), webhookRoutes);

  app.use(express.json({ limit: "200kb" }));
  app.use(express.urlencoded({ extended: false, limit: "200kb" }));

  // Light rate limit on /api/auth to slow down credential stuffing.
  app.use(
    "/api/auth",
    rateLimit({
      windowMs: 60_000,
      max: 30,
      standardHeaders: true,
      legacyHeaders: false,
    })
  );

  app.get("/health", (_req, res) =>
    res.json({ ok: true, env: env.NODE_ENV, time: new Date().toISOString() })
  );

  app.use("/api", apiRoutes);

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
