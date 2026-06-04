import { z } from "zod";
import { Driver, DriverStatus } from "../models/Driver.js";
import { toGeoPoint } from "../utils/geo.js";

export const vehicleSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1980).max(2100).optional(),
  color: z.string().optional(),
  plate: z.string().min(1),
});

export const capacitySchema = z.object({
  passengers: z.number().int().min(1).max(20),
  luggageStandard: z.number().int().min(0).max(20),
  luggageHeavy: z.number().int().min(0).max(20),
});

export const inventorySchema = z.object({
  infant: z.number().int().min(0).max(10),
  toddler: z.number().int().min(0).max(10),
  booster: z.number().int().min(0).max(10),
});

export const profileSchema = z.object({
  licenseNumber: z.string().min(1),
  vehicle: vehicleSchema,
  capacity: capacitySchema,
  childSeatInventory: inventorySchema,
});

export const inventoryPatchSchema = z.object({
  capacity: capacitySchema.partial().optional(),
  childSeatInventory: inventorySchema.partial().optional(),
});

export const statusSchema = z.object({
  status: z.enum([DriverStatus.OFFLINE, DriverStatus.ONLINE]),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export async function upsertProfile(req, res) {
  const { licenseNumber, vehicle, capacity, childSeatInventory } = req.body;
  const driver = await Driver.findOneAndUpdate(
    { user: req.user._id },
    {
      $set: {
        user: req.user._id,
        licenseNumber,
        vehicle,
        capacity,
        childSeatInventory,
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ driver });
}

export async function patchInventory(req, res) {
  const driver = await Driver.findOne({ user: req.user._id });
  if (!driver) return res.status(404).json({ error: "Driver profile not found" });

  if (req.body.capacity) Object.assign(driver.capacity, req.body.capacity);
  if (req.body.childSeatInventory) Object.assign(driver.childSeatInventory, req.body.childSeatInventory);
  await driver.save();
  res.json({ driver });
}

export async function updateStatus(req, res) {
  const driver = await Driver.findOne({ user: req.user._id });
  if (!driver) return res.status(404).json({ error: "Driver profile not found" });

  driver.status = req.body.status;
  if (typeof req.body.lat === "number" && typeof req.body.lng === "number") {
    driver.location = toGeoPoint(req.body.lat, req.body.lng);
    driver.locationUpdatedAt = new Date();
  }
  await driver.save();
  res.json({ driver });
}

export async function getMyProfile(req, res) {
  const driver = await Driver.findOne({ user: req.user._id });
  if (!driver) return res.status(404).json({ error: "Driver profile not found" });
  res.json({ driver });
}
