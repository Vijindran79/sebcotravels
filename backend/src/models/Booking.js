import mongoose from "mongoose";
import { BookingStatus, BookingStatusList } from "../utils/states.js";

const locationSchema = new mongoose.Schema(
  {
    address: { type: String, required: true, trim: true },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], required: true }, // [lng, lat]
    },
    contactName: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { _id: false }
);

const fareSchema = new mongoose.Schema(
  {
    base: { type: Number, required: true, min: 0 },
    perMile: { type: Number, required: true, min: 0 },
    distanceMiles: { type: Number, required: true, min: 0 },
    distanceFare: { type: Number, required: true, min: 0 },
    addons: {
      infantSeat: { type: Number, default: 0 },
      toddlerSeat: { type: Number, default: 0 },
      boosterSeat: { type: Number, default: 0 },
      heavyLuggage: { type: Number, default: 0 },
    },
    addonsTotal: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, lowercase: true },
  },
  { _id: false }
);

const passengersSchema = new mongoose.Schema(
  {
    adults: { type: Number, min: 1, default: 1 },
    children: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const luggageSchema = new mongoose.Schema(
  {
    standard: { type: Number, min: 0, default: 0 },
    heavy: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const childSeatsSchema = new mongoose.Schema(
  {
    infant: { type: Number, min: 0, default: 0 },
    toddler: { type: Number, min: 0, default: 0 },
    booster: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const dispatchAttemptSchema = new mongoose.Schema(
  {
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Driver" },
    at: { type: Date, default: Date.now },
    outcome: {
      type: String,
      enum: ["offered", "accepted", "rejected", "timeout", "unreachable"],
      required: true,
    },
  },
  { _id: false }
);

const statusEventSchema = new mongoose.Schema(
  {
    status: { type: String, enum: BookingStatusList, required: true },
    at: { type: Date, default: Date.now },
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reason: { type: String, default: null },
  },
  { _id: false }
);

const bookingSchema = new mongoose.Schema(
  {
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      default: null,
      index: true,
    },

    pickup: { type: locationSchema, required: true },
    dropoff: { type: locationSchema, required: true },

    passengers: { type: passengersSchema, required: true, default: () => ({}) },
    luggage: { type: luggageSchema, required: true, default: () => ({}) },
    childSeats: { type: childSeatsSchema, required: true, default: () => ({}) },

    distanceMeters: { type: Number, required: true, min: 0 },
    durationSeconds: { type: Number, required: true, min: 0 },

    fare: { type: fareSchema, required: true },

    status: {
      type: String,
      enum: BookingStatusList,
      default: BookingStatus.PENDING,
      index: true,
    },
    statusHistory: { type: [statusEventSchema], default: [] },

    dispatchAttempts: { type: [dispatchAttemptSchema], default: [] },

    // Stripe references.
    stripePaymentIntentId: { type: String, default: null, index: true },
    stripeChargeId: { type: String, default: null },
    paymentStatus: {
      type: String,
      enum: ["none", "authorized", "captured", "cancelled", "failed"],
      default: "none",
      index: true,
    },

    scheduledFor: { type: Date, default: null, index: true },
  },
  { timestamps: true }
);

// Geospatial indexes (useful for analytics / heatmaps later).
bookingSchema.index({ "pickup.location": "2dsphere" });
bookingSchema.index({ "dropoff.location": "2dsphere" });
bookingSchema.index({ status: 1, createdAt: -1 });

export const Booking = mongoose.model("Booking", bookingSchema);
