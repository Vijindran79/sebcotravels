import mongoose from "mongoose";

export const DriverStatus = Object.freeze({
  OFFLINE: "offline",
  ONLINE: "online",
  ON_TRIP: "on_trip",
});

const vehicleSchema = new mongoose.Schema(
  {
    make: { type: String, trim: true, required: true },
    model: { type: String, trim: true, required: true },
    year: { type: Number, min: 1980, max: 2100 },
    color: { type: String, trim: true },
    plate: { type: String, trim: true, required: true, uppercase: true },
  },
  { _id: false }
);

// Structural capacity = hard limits of the vehicle, NOT the driver's mood.
const capacitySchema = new mongoose.Schema(
  {
    passengers: { type: Number, min: 1, default: 4 },
    luggageStandard: { type: Number, min: 0, default: 2 },
    luggageHeavy: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

// Child seat inventory the driver physically carries.
const childSeatInventorySchema = new mongoose.Schema(
  {
    infant: { type: Number, min: 0, default: 0 },
    toddler: { type: Number, min: 0, default: 0 },
    booster: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

const driverSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    licenseNumber: { type: String, trim: true, required: true },
    vehicle: { type: vehicleSchema, required: true },
    capacity: { type: capacitySchema, required: true, default: () => ({}) },
    childSeatInventory: {
      type: childSeatInventorySchema,
      required: true,
      default: () => ({}),
    },

    status: {
      type: String,
      enum: Object.values(DriverStatus),
      default: DriverStatus.OFFLINE,
      index: true,
    },

    // Current live GPS position. 2dsphere lets us run $nearSphere queries.
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },
    locationUpdatedAt: { type: Date },

    // Active socket connection id (null when offline). Tracked so dispatch
    // can target the exact socket of a specific driver.
    socketId: { type: String, default: null, index: true },

    // Booking the driver is currently committed to (only one at a time).
    activeBooking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
      index: true,
    },

    // Stats for ranking. Not used for dispatch tiebreak yet but stored.
    completedTrips: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 5, default: 5 },

    // Stripe Connect / payout details (optional placeholder).
    payout: {
      provider: { type: String, default: "manual" }, // "manual" | "stripe"
      stripeAccountId: { type: String, default: null },
    },
  },
  { timestamps: true }
);

driverSchema.index({ location: "2dsphere" });

export const Driver = mongoose.model("Driver", driverSchema);
