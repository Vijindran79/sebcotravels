// Distance + duration between two coordinates using the Mapbox Matrix API.
// Free tier: 100,000 requests / month. No credit card required.
// Docs: https://docs.mapbox.com/api/navigation/matrix/
//
// Returns:
//   distanceMeters  (integer)
//   durationSeconds (integer)
//   distanceText    ("12.4 mi")
//   durationText    ("23 min")
import { env } from "../config/env.js";

const BASE = "https://api.mapbox.com/directions-matrix/v1/mapbox/driving";

export async function getDistanceMatrix({ origin, destination }) {
  if (!origin || !destination) {
    const err = new Error("origin and destination are required");
    err.status = 400;
    throw err;
  }
  const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;
  const params = new URLSearchParams({
    annotations: "distance,duration",
    access_token: env.MAPBOX_ACCESS_TOKEN,
  });
  const url = `${BASE}/${coords}?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    const err = new Error(`Mapbox Matrix HTTP ${res.status}: ${text.slice(0, 200)}`);
    err.status = 502;
    throw err;
  }
  const data = await res.json();
  if (data.code !== "Ok") {
    const err = new Error(`Mapbox Matrix error: ${data.code} ${data.message || ""}`.trim());
    err.status = 502;
    throw err;
  }

  // distances[origin][destination] and durations[origin][destination].
  // With 1 origin + 1 destination, the value we want is [0][1].
  const distanceMeters = Math.round(data.distances?.[0]?.[1]);
  const durationSeconds = Math.round(data.durations?.[0]?.[1]);
  if (!Number.isFinite(distanceMeters) || !Number.isFinite(durationSeconds)) {
    const err = new Error("Mapbox Matrix returned no usable values");
    err.status = 502;
    throw err;
  }

  return {
    distanceMeters,
    durationSeconds,
    distanceText: `${(distanceMeters / 1609.344).toFixed(1)} mi`,
    durationText: `${Math.round(durationSeconds / 60)} min`,
  };
}
