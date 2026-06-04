import { verifyToken } from "../middleware/auth.js";
import { User } from "../models/User.js";

// Socket.io middleware: verify JWT from handshake auth payload OR query token.
// Attaches socket.user and socket.tokenPayload.
export async function socketAuth(socket, next) {
  try {
    const token =
      socket.handshake?.auth?.token ||
      socket.handshake?.query?.token ||
      (socket.handshake?.headers?.authorization || "").replace(/^Bearer\s+/i, "");
    if (!token) return next(new Error("missing token"));

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub);
    if (!user || user.disabled) return next(new Error("invalid user"));

    socket.user = user;
    socket.tokenPayload = decoded;
    next();
  } catch (err) {
    next(new Error(err.message || "auth failed"));
  }
}
