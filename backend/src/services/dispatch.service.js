// Dispatch engine.
//
// Responsibilities:
//   1. Find the closest eligible online driver that can fulfil a booking.
//      "Eligible" = capacity, luggage, and child-seat-inventory match.
//   2. Send a Socket.io offer to that driver and start a 30s timer.
//   3. On accept => lock the booking + driver, transition state, notify pax.
//   4. On reject / timeout => mark this driver tried, try the next one.
//   5. When candidates run out OR DISPATCH_MAX_ATTEMPTS hit => mark booking
//      FAILED and cancel the Stripe authorisation hold.
//
// NOTE: timers and tried-driver sets are kept in-process memory. For PM2
// cluster mode you'll need to back them with Redis (see README).

import mongoose from "mongoose";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";
import { Booking } from "../models/Booking.js";
import { Driver, DriverStatus } from "../models/Driver.js";
import { BookingStatus, assertTransition, isTerminal } from "../utils/states.js";
import { fromGeoPoint } from "../utils/geo.js";
import { cancelPayment } from "./stripe.service.js";
import { getIo, passengerRoom, driverRoom } from "../realtime/io.js";

// bookingId -> { driverId, timer, expiresAt, attemptIndex }
const pendingOffers = new Map();
// bookingId -> Set<driverId> we have already tried
const triedByBooking = new Map();

function markTried(bookingId, driverId) {
  let set = triedByBooking.get(String(bookingId));
  if (!set) {
    set = new Set();
    triedByBooking.set(String(bookingId), set);
  }
  set.add(String(driverId));
}

function getTried(bookingId) {
  return triedByBooking.get(String(bookingId)) || new Set();
}

function clearTimerFor(bookingId) {
  const entry = pendingOffers.get(String(bookingId));
  if (entry?.timer) clearTimeout(entry.timer);
  pendingOffers.delete(String(bookingId));
}

export function isOfferOutstanding(bookingId, driverId) {
  const entry = pendingOffers.get(String(bookingId));
  return !!(entry && String(entry.driverId) === String(driverId));
}

// Push the booking to the next-closest eligible driver. Recurses until either
// a driver is offered OR no drivers remain.
export async function dispatch(bookingId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    logger.warn({ bookingId }, "dispatch: booking gone");
    return;
  }
  if (isTerminal(booking.status)) {
    logger.info({ bookingId, status: booking.status }, "dispatch: booking already terminal");
    return;
  }
  if (booking.status === BookingStatus.PENDING) {
    booking.status = BookingStatus.BROADCASTING;
    booking.statusHistory.push({ status: BookingStatus.BROADCASTING, at: new Date() });
    await booking.save();
    getIo().to(passengerRoom(booking.passenger)).emit("booking:status", {
      bookingId: booking._id.toString(),
      status: booking.status,
    });
  }

  const attemptCount = booking.dispatchAttempts.length;
  if (attemptCount >= env.DISPATCH_MAX_ATTEMPTS) {
    logger.warn({ bookingId, attemptCount }, "dispatch: max attempts reached");
    await failBooking(booking, "no_drivers_available");
    return;
  }

  const tried = getTried(bookingId);
  const driver = await findNextEligibleDriver(booking, tried);
  if (!driver) {
    logger.info({ bookingId, attemptCount, triedCount: tried.size }, "dispatch: no more eligible drivers");
    await failBooking(booking, "no_drivers_available");
    return;
  }

  markTried(bookingId, driver._id);
  booking.dispatchAttempts.push({ driver: driver._id, at: new Date(), outcome: "offered" });
  await booking.save();

  const expiresInMs = env.DISPATCH_TIMEOUT_MS;
  const expiresAt = Date.now() + expiresInMs;
  const timer = setTimeout(() => {
    handleTimeout(bookingId, driver._id).catch((err) =>
      logger.error({ err, bookingId, driverId: driver._id }, "dispatch: timeout handler failed")
    );
  }, expiresInMs);

  pendingOffers.set(String(bookingId), {
    driverId: driver._id,
    timer,
    expiresAt,
    attemptIndex: attemptCount,
  });

  const io = getIo();
  io.to(driverRoom(driver._id)).emit("dispatch:offer", {
    bookingId: booking._id.toString(),
    pickup: booking.pickup,
    dropoff: booking.dropoff,
    passengers: booking.passengers,
    luggage: booking.luggage,
    childSeats: booking.childSeats,
    fare: booking.fare,
    distanceMeters: booking.distanceMeters,
    durationSeconds: booking.durationSeconds,
    expiresInMs,
  });

  logger.info({ bookingId, driverId: driver._id.toString(), expiresInMs }, "dispatch: offered");
}

async function findNextEligibleDriver(booking, triedSet) {
  const pickupCoords = booking.pickup.location.coordinates; // [lng, lat]
  const triedIds = Array.from(triedSet).map((s) => new mongoose.Types.ObjectId(s));

  // We use $geoNear (aggregation) so we can filter on the other criteria in
  // the same pipeline. Capacity / inventory must each be >= the request.
  const reqPax = (booking.passengers?.adults || 0) + (booking.passengers?.children || 0);
  const reqStandardLuggage = booking.luggage?.standard || 0;
  const reqHeavyLuggage = booking.luggage?.heavy || 0;
  const reqInfant = booking.childSeats?.infant || 0;
  const reqToddler = booking.childSeats?.toddler || 0;
  const reqBooster = booking.childSeats?.booster || 0;

  const pipeline = [
    {
      $geoNear: {
        near: { type: "Point", coordinates: pickupCoords },
        distanceField: "distanceMeters",
        maxDistance: env.DISPATCH_SEARCH_RADIUS_METERS,
        spherical: true,
        query: {
          status: DriverStatus.ONLINE,
          activeBooking: null,
          socketId: { $ne: null },
          _id: { $nin: triedIds },
          "capacity.passengers": { $gte: reqPax },
          "capacity.luggageStandard": { $gte: reqStandardLuggage },
          "capacity.luggageHeavy": { $gte: reqHeavyLuggage },
          "childSeatInventory.infant": { $gte: reqInfant },
          "childSeatInventory.toddler": { $gte: reqToddler },
          "childSeatInventory.booster": { $gte: reqBooster },
        },
      },
    },
    { $limit: 1 },
  ];

  const [match] = await Driver.aggregate(pipeline);
  if (!match) return null;
  return Driver.findById(match._id);
}

export async function handleAccept(bookingId, driverId) {
  const entry = pendingOffers.get(String(bookingId));
  if (!entry || String(entry.driverId) !== String(driverId)) {
    const err = new Error("Offer is no longer valid");
    err.status = 409;
    err.code = "OFFER_EXPIRED";
    throw err;
  }
  clearTimerFor(bookingId);

  // Atomically claim: only if booking is still broadcasting AND driver is
  // still online + free. This avoids races between accept and cancel.
  const booking = await Booking.findOneAndUpdate(
    { _id: bookingId, status: BookingStatus.BROADCASTING },
    {
      $set: { status: BookingStatus.ACCEPTED, driver: driverId },
      $push: {
        statusHistory: { status: BookingStatus.ACCEPTED, at: new Date() },
        dispatchAttempts: { driver: driverId, at: new Date(), outcome: "accepted" },
      },
    },
    { new: true }
  );
  if (!booking) {
    const err = new Error("Booking is no longer broadcasting");
    err.status = 409;
    err.code = "BOOKING_GONE";
    throw err;
  }

  const driver = await Driver.findOneAndUpdate(
    { _id: driverId, activeBooking: null, status: DriverStatus.ONLINE },
    { $set: { activeBooking: booking._id, status: DriverStatus.ON_TRIP } },
    { new: true }
  );
  if (!driver) {
    // Roll back the booking and continue dispatching.
    booking.status = BookingStatus.BROADCASTING;
    booking.driver = null;
    booking.statusHistory.push({ status: BookingStatus.BROADCASTING, at: new Date(), reason: "driver_unavailable" });
    await booking.save();
    await dispatch(bookingId);
    const err = new Error("Driver became unavailable");
    err.status = 409;
    err.code = "DRIVER_UNAVAILABLE";
    throw err;
  }

  const io = getIo();
  io.to(passengerRoom(booking.passenger)).emit("booking:assigned", {
    bookingId: booking._id.toString(),
    driver: {
      id: driver._id.toString(),
      vehicle: driver.vehicle,
      rating: driver.rating,
      location: fromGeoPoint(driver.location),
    },
  });
  io.to(passengerRoom(booking.passenger)).emit("booking:status", {
    bookingId: booking._id.toString(),
    status: booking.status,
  });

  triedByBooking.delete(String(bookingId));
  return booking;
}

export async function handleReject(bookingId, driverId) {
  const entry = pendingOffers.get(String(bookingId));
  if (!entry || String(entry.driverId) !== String(driverId)) return; // stale
  clearTimerFor(bookingId);

  const booking = await Booking.findById(bookingId);
  if (!booking || isTerminal(booking.status)) return;
  booking.dispatchAttempts.push({ driver: driverId, at: new Date(), outcome: "rejected" });
  await booking.save();
  await dispatch(bookingId);
}

async function handleTimeout(bookingId, driverId) {
  const entry = pendingOffers.get(String(bookingId));
  if (!entry || String(entry.driverId) !== String(driverId)) return;
  pendingOffers.delete(String(bookingId));

  const booking = await Booking.findById(bookingId);
  if (!booking || isTerminal(booking.status)) return;
  booking.dispatchAttempts.push({ driver: driverId, at: new Date(), outcome: "timeout" });
  await booking.save();

  getIo().to(driverRoom(driverId)).emit("dispatch:cancelled", {
    bookingId: String(bookingId),
    reason: "timeout",
  });

  await dispatch(bookingId);
}

async function failBooking(booking, reason) {
  if (isTerminal(booking.status)) return;
  assertTransition(booking.status, BookingStatus.FAILED);
  booking.status = BookingStatus.FAILED;
  booking.statusHistory.push({ status: BookingStatus.FAILED, at: new Date(), reason });
  await booking.save();

  if (booking.stripePaymentIntentId && booking.paymentStatus === "authorized") {
    try {
      await cancelPayment(booking.stripePaymentIntentId, "abandoned");
      booking.paymentStatus = "cancelled";
      await booking.save();
    } catch (err) {
      logger.error({ err, bookingId: booking._id }, "dispatch: stripe cancel failed");
    }
  }

  triedByBooking.delete(String(booking._id));
  getIo().to(passengerRoom(booking.passenger)).emit("booking:status", {
    bookingId: booking._id.toString(),
    status: booking.status,
    reason,
  });
}

// Public: called by HTTP cancel endpoint.
export async function cancelBookingByPassenger(booking, reason = "passenger_cancelled") {
  clearTimerFor(booking._id);
  triedByBooking.delete(String(booking._id));

  if (booking.driver) {
    getIo().to(driverRoom(booking.driver)).emit("dispatch:cancelled", {
      bookingId: booking._id.toString(),
      reason,
    });
    await Driver.findByIdAndUpdate(booking.driver, {
      $set: { activeBooking: null, status: DriverStatus.ONLINE },
    });
  }
}
