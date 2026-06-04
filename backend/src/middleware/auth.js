import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { User, UserRole } from "../models/User.js";

export function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, email: user.email },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

export function verifyToken(token) {
  return jwt.verify(token, env.JWT_SECRET);
}

function extractToken(req) {
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) return header.slice("Bearer ".length).trim();
  if (req.query && typeof req.query.token === "string") return req.query.token;
  return null;
}

export async function requireAuth(req, _res, next) {
  try {
    const token = extractToken(req);
    if (!token) {
      const err = new Error("Missing bearer token");
      err.status = 401;
      throw err;
    }
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);
    if (!user || user.disabled) {
      const err = new Error("Invalid or disabled user");
      err.status = 401;
      throw err;
    }
    req.user = user;
    req.tokenPayload = decoded;
    next();
  } catch (err) {
    if (!err.status) err.status = 401;
    next(err);
  }
}

export function requireRole(...roles) {
  const allowed = new Set(roles);
  return (req, _res, next) => {
    if (!req.user) {
      const err = new Error("Unauthenticated");
      err.status = 401;
      return next(err);
    }
    if (!allowed.has(req.user.role)) {
      const err = new Error(`Requires role: ${[...allowed].join(", ")}`);
      err.status = 403;
      return next(err);
    }
    next();
  };
}

export { UserRole };
