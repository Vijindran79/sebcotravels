// Public-facing lead capture.
// A "lead" is a booking enquiry submitted from the marketing site by a
// visitor who is NOT logged in. It does NOT create a Booking, does NOT
// charge Stripe, and does NOT dispatch a driver. It just records the
// enquiry + (if pickup/dropoff coords are present) computes the upfront
// fare via the Distance Matrix so we can quote it back to the visitor
// instantly.
//
// Dispatch / Stripe pre-auth happens later, after the customer has
// signed in or accepted a callback.

import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    address: { type: String, trim: true, required: true },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },
  },
  { _id: false }
);

const fareSnapshotSchema = new mongoose.Schema(
  {
    base: Number,
    perMile: Number,
    distanceMiles: Number,
    distanceFare: Number,
    addonsTotal: Number,
    total: Number,
    currency: String,
  },
  { _id: false }
);

const leadSchema = new mongoose.Schema(
  {
    contact: {
      name: { type: String, trim: true, required: true },
      email: { type: String, trim: true, lowercase: true, required: true },
      phone: { type: String, trim: true, required: true },
    },
    pickup: { type: placeSchema, required: true },
    dropoff: { type: placeSchema, required: true },
    passengers: {
      adults: { type: Number, min: 1, default: 1 },
      children: { type: Number, min: 0, default: 0 },
    },
    luggage: {
      standard: { type: Number, min: 0, default: 0 },
      heavy: { type: Number, min: 0, default: 0 },
    },
    childSeats: {
      infant: { type: Number, min: 0, default: 0 },
      toddler: { type: Number, min: 0, default: 0 },
      booster: { type: Number, min: 0, default: 0 },
    },
    scheduledFor: { type: Date, default: null },
    distanceMeters: { type: Number, default: null },
    durationSeconds: { type: Number, default: null },
    fare: { type: fareSnapshotSchema, default: null },
    quoteStatus: {
      type: String,
      enum: ["quoted", "quote_unavailable"],
      default: "quote_unavailable",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "converted", "lost"],
      default: "new",
      index: true,
    },
    source: { type: String, default: "website" },
    userAgent: { type: String, default: null },
    ip: { type: String, default: null },
    notes: { type: String, default: null },
  },
  { timestamps: true }
);

leadSchema.index({ createdAt: -1 });
leadSchema.index({ "contact.email": 1 });

export const Lead = mongoose.model("Lead", leadSchema);
