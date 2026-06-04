// Wire socket events for both passengers and drivers. The dispatch engine
// emits server-side; this module handles client-originated events.
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { Driver, DriverStatus } from "../models/Driver.js";
import { Booking } from "../models/Booking.js";
import { UserRole } from "../middleware/auth.js";
import { passengerRoom, driverRoom, bookingRoom } from "./io.js";
import { handleAccept, handleReject } from "../services/dispatch.service.js";

// Throttle DB writes for driver GPS: { driverId: lastPersistedAt }
const lastDriverPersist = new Map();

export function registerSocketHandlers(io) {
  io.on("connection", async (socket) => {
    const user = socket.user;
    const role = user.role;
    logger.info({ socketId: socket.id, userId: user._id.toString(), role }, "socket: connected");

    if (role === UserRole.PASSENGER || role === UserRole.ADMIN) {
      socket.join(passengerRoom(user._id));
    }

    let driverDoc = null;
    if (role === UserRole.DRIVER) {
      driverDoc = await Driver.findOneAndUpdate(
        { user: user._id },
        { $set: { socketId: socket.id, status: DriverStatus.ONLINE } },
        { new: true }
      );
      if (!driverDoc) {
        socket.emit("error", { error: "Driver profile missing. POST /api/drivers/profile first." });
        return socket.disconnect(true);
      }
      socket.join(driverRoom(driverDoc._id));
      if (driverDoc.activeBooking) {
        socket.join(bookingRoom(driverDoc.activeBooking));
      }
    }

    // ---------- Passenger: subscribe to live updates for a specific booking ----------
    socket.on("booking:subscribe", async ({ bookingId } = {}, ack) => {
      try {
        if (!bookingId) throw new Error("bookingId required");
        const booking = await Booking.findById(bookingId);
        if (!booking) throw new Error("not found");
        if (String(booking.passenger) !== String(user._id) && role !== UserRole.ADMIN) {
          throw new Error("forbidden");
        }
        socket.join(bookingRoom(bookingId));
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    // ---------- Driver: accept / reject a dispatch offer ----------
    socket.on("dispatch:accept", async ({ bookingId } = {}, ack) => {
      try {
        if (role !== UserRole.DRIVER) throw Object.assign(new Error("driver only"), { status: 403 });
        const driver = await Driver.findOne({ user: user._id });
        if (!driver) throw new Error("no driver profile");
        const booking = await handleAccept(bookingId, driver._id);
        socket.join(bookingRoom(booking._id));
        ack?.({ ok: true, bookingId: booking._id.toString() });
      } catch (err) {
        ack?.({ ok: false, error: err.message, code: err.code });
      }
    });

    socket.on("dispatch:reject", async ({ bookingId } = {}, ack) => {
      try {
        if (role !== UserRole.DRIVER) throw Object.assign(new Error("driver only"), { status: 403 });
        const driver = await Driver.findOne({ user: user._id });
        if (!driver) throw new Error("no driver profile");
        await handleReject(bookingId, driver._id);
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    // ---------- Driver: live GPS broadcast ----------
    socket.on("gps:update", async (payload = {}) => {
      try {
        if (role !== UserRole.DRIVER) return;
        const { lat, lng, heading, speed } = payload;
        if (typeof lat !== "number" || typeof lng !== "number") return;

        const driver = driverDoc || (await Driver.findOne({ user: user._id }));
        if (!driver) return;

        // Always relay to the booking room (real-time map for passenger).
        if (driver.activeBooking) {
          io.to(bookingRoom(driver.activeBooking)).emit("driver:location", {
            bookingId: String(driver.activeBooking),
            lat,
            lng,
            heading: heading ?? null,
            speed: speed ?? null,
            at: new Date().toISOString(),
          });
        }

        // Throttle DB writes.
        const now = Date.now();
        const last = lastDriverPersist.get(String(driver._id)) || 0;
        if (now - last >= env.DRIVER_LOCATION_PERSIST_MS) {
          lastDriverPersist.set(String(driver._id), now);
          await Driver.updateOne(
            { _id: driver._id },
            {
              $set: {
                location: { type: "Point", coordinates: [lng, lat] },
                locationUpdatedAt: new Date(),
              },
            }
          );
        }
      } catch (err) {
        logger.error({ err }, "gps:update failed");
      }
    });

    // ---------- Driver goes offline manually ----------
    socket.on("driver:offline", async (_payload, ack) => {
      try {
        if (role !== UserRole.DRIVER) throw new Error("driver only");
        await Driver.updateOne(
          { user: user._id, activeBooking: null },
          { $set: { status: DriverStatus.OFFLINE, socketId: null } }
        );
        ack?.({ ok: true });
      } catch (err) {
        ack?.({ ok: false, error: err.message });
      }
    });

    socket.on("disconnect", async (reason) => {
      logger.info({ socketId: socket.id, userId: user._id.toString(), reason }, "socket: disconnected");
      if (role === UserRole.DRIVER) {
        // Only flip to OFFLINE if this is still the active socket AND the
        // driver isn't mid-trip. Mid-trip drivers stay ON_TRIP so the
        // booking isn't blown up by a momentary network blip.
        await Driver.updateOne(
          { user: user._id, socketId: socket.id, activeBooking: null },
          { $set: { status: DriverStatus.OFFLINE, socketId: null } }
        );
        await Driver.updateOne(
          { user: user._id, socketId: socket.id, activeBooking: { $ne: null } },
          { $set: { socketId: null } }
        );
      }
    });
  });
}
