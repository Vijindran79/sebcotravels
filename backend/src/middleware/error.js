import { ZodError } from "zod";
import { logger } from "../config/logger.js";

export function notFound(_req, res, _next) {
  res.status(404).json({ error: "Not found" });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      issues: err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
      })),
    });
  }

  const status = Number.isInteger(err.status) ? err.status : 500;
  const payload = {
    error: err.message || "Internal server error",
  };
  if (err.code) payload.code = err.code;

  if (status >= 500) {
    logger.error({ err, path: req.originalUrl, method: req.method }, "request failed");
  } else {
    logger.warn({ status, msg: err.message, path: req.originalUrl }, "request rejected");
  }

  res.status(status).json(payload);
}
