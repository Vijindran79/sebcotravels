// Geo helpers. All Mongo points are stored as [longitude, latitude] per
// GeoJSON. Helpers here normalise lat/lng inputs and meters <-> miles.

export const METERS_PER_MILE = 1609.344;

export function metersToMiles(m) {
  return m / METERS_PER_MILE;
}

export function milesToMeters(mi) {
  return mi * METERS_PER_MILE;
}

export function toGeoPoint(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    const err = new Error("Invalid coordinates");
    err.status = 400;
    err.code = "BAD_COORDS";
    throw err;
  }
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    const err = new Error("Coordinates out of range");
    err.status = 400;
    err.code = "BAD_COORDS";
    throw err;
  }
  return { type: "Point", coordinates: [lng, lat] };
}

export function fromGeoPoint(point) {
  if (!point || !Array.isArray(point.coordinates) || point.coordinates.length !== 2) return null;
  const [lng, lat] = point.coordinates;
  return { lat, lng };
}
