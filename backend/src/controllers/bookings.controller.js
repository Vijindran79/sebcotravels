import { z } from "zod";
import mongoose from "mongoose";
import { Booking } from "../models/Booking.js";
import { Driver, DriverStatus } from "../models/Driver.js";
import { BookingStatus, assertTransition, isTerminal } from "../utils/states.js";
import { quoteFare } from "../services/pricing.service.js";
import { authorizePayment, capturePayment, cancelPayment, ensureCustomer } from "../services/stripe.service.js";
import { sendCustomerConfirmation, sendOperatorNotification } from "../services/email.service.js";
import { cancelBookingByPassenger } from "../services/dispatch.service.js";
import { getIo, passengerRoom, driverRoom, bookingRoom } from "../realtime/io.js";
import { toGeoPoint } from "../utils/geo.js";
import { MIN_LEAD_TIME_MS } from "./leads.controller.js";

const locationInputSchema = z.object({
  address: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
});

export const createBookingSchema = z.object({
  pickup: locationInputSchema,
  dropoff: locationInputSchema,
  passengers: z
    .object({
      adults: z.number().int().min(1).max(12).default(1),
      children: z.number().int().min(0).max(12).default(0),
    })
    .default({ adults: 1, children: 0 }),
  luggage: z
    .object({
      standard: z.number().int().min(0).max(20).default(0),
      heavy: z.number().int().min(0).max(20).default(0),
    })
    .default({ standard: 0, heavy: 0 }),
  childSeats: z
    .object({
      infant: z.number().int().min(0).max(10).default(0),
      toddler: z.number().int().min(0).max(10).default(0),
      booster: z.number().int().min(0).max(10).default(0),
    })
    .default({ infant: 0, toddler: 0, booster: 0 }),
  // Pre-booking only: scheduledFor REQUIRED and must be \u2265 1h from now.
  scheduledFor: z
    .string()
    .datetime()
    .refine((iso) => new Date(iso).getTime() - Date.now() >= MIN_LEAD_TIME_MS - 60_000, {
      message: "Pick-up must be at least 1 hour from now",
    }),
});

const ADVANCE_NEXT = {
  [BookingStatus.ACCEPTED]: BookingStatus.EN_ROUTE,
  [BookingStatus.EN_ROUTE]: BookingStatus.ARRIVED,
  [BookingStatus.ARRIVED]: BookingStatus.IN_PROGRESS,
  [BookingStatus.IN_PROGRESS]: BookingStatus.COMPLETED,
};

export async function createBooking(req, res) {
  const body = req.body;
  const childCount = body.passengers.children || 0;
  const seatCount =
    body.childSeats.infant + body.childSeats.toddler + body.childSeats.booster;
  if (seatCount > childCount) {
    return res.status(400).json({
      error: `childSeats total (${seatCount}) exceeds children count (${childCount})`,
    });
  }

  const matrix = await quoteFare({
    pickup: { lat: body.pickup.lat, lng: body.pickup.lng },
    dropoff: { lat: body.dropoff.lat, lng: body.dropoff.lng },
    childSeats: body.childSeats,
    luggage: body.luggage,
  });

  const booking = await Booking.create({
    passenger: req.user._id,
    pickup: {
      address: body.pickup.address,
      location: toGeoPoint(body.pickup.lat, body.pickup.lng),
      contactName: body.pickup.contactName,
      contactPhone: body.pickup.contactPhone,
      notes: body.pickup.notes,
    },
    dropoff: {
      address: body.dropoff.address,
      location: toGeoPoint(body.dropoff.lat, body.dropoff.lng),
      contactName: body.dropoff.contactName,
      contactPhone: body.dropoff.contactPhone,
      notes: body.dropoff.notes,
    },
    passengers: body.passengers,
    luggage: body.luggage,
    childSeats: body.childSeats,
    distanceMeters: matrix.distanceMeters,
    durationSeconds: matrix.durationSeconds,
    fare: matrix.fare,
    status: BookingStatus.PENDING,
    statusHistory: [{ status: BookingStatus.PENDING, at: new Date(), by: req.user._id }],
    scheduledFor: new Date(body.scheduledFor),
  });

  // Stripe authorisation hold (manual capture).
  try {
    const customerId = await ensureCustomer(req.user);
    const intent = await authorizePayment({
      amountMajor: matrix.fare.total,
      currency: matrix.fare.currency,
      bookingId: booking._id.toString(),
      customerId,
      metadata: { passengerId: req.user._id.toString() },
    });
    booking.stripePaymentIntentId = intent.id;
    booking.paymentStatus = "authorized";
    await booking.save();
  } catch (err) {
    booking.statusHistory.push({
      status: BookingStatus.PENDING,
      at: new Date(),
      reason: `stripe_authorize_failed: ${err.message}`,
    });
    await booking.save();
    return res.status(402).json({
      error: "Payment authorization failed",
      detail: err.message,
      bookingId: booking._id.toString(),
    });
  }

  // Pre-booking mode: do NOT auto-dispatch on create. The booking sits as
  // PENDING until a scheduled job (or admin) triggers dispatch close to the
  // pick-up time. Solo operators can also just review and confirm manually.
  // TODO: when you scale to instant booking, add a scheduler that calls
  // dispatch(booking._id) at (scheduledFor - 30 min).

  // Email the customer + the operator. Failures are swallowed.
  const leadForEmail = {
    refId: booking._id.toString().slice(-6).toUpperCase(),
    contact: { name: req.user.name, email: req.user.email, phone: req.user.phone || '' },
    pickup: body.pickup,
    dropoff: body.dropoff,
    passengers: body.passengers,
    luggage: body.luggage,
    childSeats: body.childSeats,
    scheduledFor: body.scheduledFor,
    notes: body.notes,
    fare: matrix.fare && matrix.fare.total
      ? { total: matrix.fare.total, distanceMiles: matrix.fare.distanceMiles }
      : null,
  };
  Promise.allSettled([
    sendCustomerConfirmation(leadForEmail),
    sendOperatorNotification(leadForEmail),
  ]).catch(() => { /* errors already logged inside the service */ });

  res.status(201).json({ booking });
}

export async function getBooking(req, res) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ error: "Invalid booking id" });
  }
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: "Not found" });

  const isOwner = String(booking.passenger) === String(req.user._id);
  let isAssignedDriver = false;
  if (booking.driver) {
    const driver = await Driver.findOne({ _id: booking.driver, user: req.user._id });
    isAssignedDriver = !!driver;
  }
  if (!isOwner && !isAssignedDriver && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.json({ booking });
}

export async function cancelBooking(req, res) {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: "Not found" });
  if (String(booking.passenger) !== String(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  if (isTerminal(booking.status)) {
    return res.status(409).json({ error: `Already ${booking.status}` });
  }

  assertTransition(booking.status, BookingStatus.CANCELLED);
  await cancelBookingByPassenger(booking, "passenger_cancelled");

  booking.status = BookingStatus.CANCELLED;
  booking.statusHistory.push({
    status: BookingStatus.CANCELLED,
    at: new Date(),
    by: req.user._id,
    reason: "passenger_cancelled",
  });

  if (booking.stripePaymentIntentId && booking.paymentStatus === "authorized") {
    try {
      await cancelPayment(booking.stripePaymentIntentId, "requested_by_customer");
      booking.paymentStatus = "cancelled";
    } catch (err) {
      booking.statusHistory.push({
        status: BookingStatus.CANCELLED,
        at: new Date(),
        reason: `stripe_cancel_failed: ${err.message}`,
      });
    }
  }
  await booking.save();

  getIo().to(passengerRoom(booking.passenger)).emit("booking:status", {
    bookingId: booking._id.toString(),
    status: booking.status,
  });
  res.json({ booking });
}

// Driver-side state advance: en_route -> arrived -> in_progress -> completed.
export async function advanceBooking(req, res) {
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: "Not found" });

  const driver = await Driver.findOne({ user: req.user._id });
  if (!driver || String(booking.driver) !== String(driver._id)) {
    return res.status(403).json({ error: "Not your booking" });
  }

  const next = ADVANCE_NEXT[booking.status];
  if (!next) {
    return res.status(409).json({ error: `Cannot advance from ${booking.status}` });
  }
  assertTransition(booking.status, next);

  booking.status = next;
  booking.statusHistory.push({ status: next, at: new Date(), by: req.user._id });

  if (next === BookingStatus.COMPLETED) {
    // Capture the Stripe auth hold.
    if (booking.stripePaymentIntentId && booking.paymentStatus === "authorized") {
      try {
        const captured = await capturePayment(booking.stripePaymentIntentId);
        booking.paymentStatus = "captured";
        booking.stripeChargeId = captured.latest_charge || null;
      } catch (err) {
        booking.statusHistory.push({
          status: next,
          at: new Date(),
          reason: `stripe_capture_failed: ${err.message}`,
        });
      }
    }
    // Release the driver.
    await Driver.updateOne(
      { _id: driver._id },
      { $set: { activeBooking: null, status: DriverStatus.ONLINE }, $inc: { completedTrips: 1 } }
    );
  }

  await booking.save();

  const io = getIo();
  io.to(passengerRoom(booking.passenger)).emit("booking:status", {
    bookingId: booking._id.toString(),
    status: booking.status,
  });
  io.to(bookingRoom(booking._id)).emit("booking:status", {
    bookingId: booking._id.toString(),
    status: booking.status,
  });
  io.to(driverRoom(driver._id)).emit("booking:status", {
    bookingId: booking._id.toString(),
    status: booking.status,
  });

  res.json({ booking });
}

export async function listMyBookings(req, res) {
  const filter = req.user.role === "driver"
    ? { driver: (await Driver.findOne({ user: req.user._id }))?._id }
    : { passenger: req.user._id };
  if (!filter.passenger && !filter.driver) return res.json({ bookings: [] });
  const bookings = await Booking.find(filter).sort({ createdAt: -1 }).limit(50);
  res.json({ bookings });
}
