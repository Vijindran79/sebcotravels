import { z } from "zod";
import { Lead } from "../models/Lead.js";
import { quoteFare } from "../services/pricing.service.js";
import { sendCustomerConfirmation, sendOperatorNotification } from "../services/email.service.js";
import { logger } from "../config/logger.js";

const placeSchema = z.object({
  address: z.string().min(2).max(300),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

// Minimum lead time for pre-booking: 1 hour. Keep this in sync with the
// frontend BookingForm and with bookings.controller.createBookingSchema.
export const MIN_LEAD_TIME_MS = 60 * 60 * 1000;

export const createLeadSchema = z
  .object({
    contact: z.object({
      name: z.string().min(1).max(120),
      email: z.string().email().max(200),
      phone: z.string().min(6).max(40),
    }),
    vehicleType: z.enum(['car', 'van']).default('van'),
    pickup: placeSchema,
    dropoff: placeSchema,
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
    // Pre-booking only: scheduledFor is REQUIRED and must be at least
    // 1 hour in the future.
    scheduledFor: z
      .string()
      .datetime()
      .refine((iso) => new Date(iso).getTime() - Date.now() >= MIN_LEAD_TIME_MS - 60_000, {
        message: "Pick-up must be at least 1 hour from now",
      }),
    notes: z.string().max(1000).optional(),
  });

export async function createLead(req, res) {
  const body = req.body;

  const childTotal = body.passengers.children || 0;
  const seatTotal =
    body.childSeats.infant + body.childSeats.toddler + body.childSeats.booster;
  if (seatTotal > childTotal) {
    return res.status(400).json({
      error: `childSeats total (${seatTotal}) exceeds children count (${childTotal})`,
    });
  }

  let distanceMeters = null;
  let durationSeconds = null;
  let fare = null;
  let quoteStatus = "quote_unavailable";

  const haveCoords =
    typeof body.pickup.lat === "number" &&
    typeof body.pickup.lng === "number" &&
    typeof body.dropoff.lat === "number" &&
    typeof body.dropoff.lng === "number";

  if (haveCoords) {
    try {
      const matrix = await quoteFare({
        pickup: { lat: body.pickup.lat, lng: body.pickup.lng },
        dropoff: { lat: body.dropoff.lat, lng: body.dropoff.lng },
        childSeats: body.childSeats,
        luggage: body.luggage,
        vehicleType: body.vehicleType,
      });
      distanceMeters = matrix.distanceMeters;
      durationSeconds = matrix.durationSeconds;
      fare = matrix.fare;
      quoteStatus = "quoted";
    } catch (err) {
      logger.warn({ err: err.message }, "leads: distance matrix failed; saving lead without quote");
    }
  }

  const lead = await Lead.create({
    contact: body.contact,
    vehicleType: body.vehicleType,
    pickup: body.pickup,
    dropoff: body.dropoff,
    passengers: body.passengers,
    luggage: body.luggage,
    childSeats: body.childSeats,
    scheduledFor: new Date(body.scheduledFor),
    notes: body.notes,
    distanceMeters,
    durationSeconds,
    fare,
    quoteStatus,
    userAgent: req.headers["user-agent"]?.slice(0, 400) || null,
    ip: req.ip || null,
  });

  // Send confirmation emails in the background. Never blocks or fails
  // the request. Logs everything to the server console.
  const leadForEmail = {
    refId: lead._id.toString().slice(-6).toUpperCase(),
    contact: body.contact,
    vehicleType: body.vehicleType,
    pickup: body.pickup,
    dropoff: body.dropoff,
    passengers: body.passengers,
    luggage: body.luggage,
    childSeats: body.childSeats,
    scheduledFor: body.scheduledFor,
    notes: body.notes,
    fare: fare && fare.total ? { total: fare.total, distanceMiles: fare.distanceMiles } : null,
  };
  Promise.allSettled([
    sendCustomerConfirmation(leadForEmail),
    sendOperatorNotification(leadForEmail),
  ]).catch(() => { /* already logged inside the service */ });

  res.status(201).json({
    leadId: lead._id.toString(),
    quoteStatus,
    fare,
    distanceMeters,
    durationSeconds,
  });
}
