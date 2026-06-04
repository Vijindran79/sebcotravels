// Server-side authoritative fare formula:
//   total = base + (miles * perMile) + sum(addons)
// All numbers are in the major currency unit (e.g. GBP).
// Stripe needs them in MINOR units (pence); use toStripeAmount() for that.

import { env } from "../config/env.js";
import { getDistanceMatrix } from "./maps.service.js";
import { metersToMiles } from "../utils/geo.js";

const round2 = (n) => Math.round(n * 100) / 100;

export function computeFare({ distanceMeters, childSeats = {}, luggage = {} }) {
  const miles = metersToMiles(distanceMeters);

  const base = env.FARE_BASE;
  const perMile = env.FARE_PER_MILE;
  const distanceFare = round2(miles * perMile);

  const addons = {
    infantSeat: round2((childSeats.infant || 0) * env.FARE_ADDON_INFANT_SEAT),
    toddlerSeat: round2((childSeats.toddler || 0) * env.FARE_ADDON_TODDLER_SEAT),
    boosterSeat: round2((childSeats.booster || 0) * env.FARE_ADDON_BOOSTER_SEAT),
    heavyLuggage: round2((luggage.heavy || 0) * env.FARE_ADDON_HEAVY_LUGGAGE),
  };
  const addonsTotal = round2(
    addons.infantSeat + addons.toddlerSeat + addons.boosterSeat + addons.heavyLuggage
  );

  const total = round2(base + distanceFare + addonsTotal);

  return {
    base,
    perMile,
    distanceMiles: round2(miles),
    distanceFare,
    addons,
    addonsTotal,
    total,
    currency: env.FARE_CURRENCY,
  };
}

export async function quoteFare({ pickup, dropoff, childSeats, luggage }) {
  const matrix = await getDistanceMatrix({
    origin: { lat: pickup.lat, lng: pickup.lng },
    destination: { lat: dropoff.lat, lng: dropoff.lng },
  });

  const fare = computeFare({
    distanceMeters: matrix.distanceMeters,
    childSeats,
    luggage,
  });

  return {
    distanceMeters: matrix.distanceMeters,
    durationSeconds: matrix.durationSeconds,
    distanceText: matrix.distanceText,
    durationText: matrix.durationText,
    fare,
  };
}

// Convert a major-unit amount to Stripe minor units (integer).
export function toStripeAmount(major) {
  return Math.round(Number(major) * 100);
}
