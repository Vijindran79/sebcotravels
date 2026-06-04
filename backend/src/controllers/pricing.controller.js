import { z } from "zod";
import { quoteFare } from "../services/pricing.service.js";

const latLng = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const quoteSchema = z.object({
  pickup: latLng,
  dropoff: latLng,
  childSeats: z
    .object({
      infant: z.number().int().min(0).max(10).default(0),
      toddler: z.number().int().min(0).max(10).default(0),
      booster: z.number().int().min(0).max(10).default(0),
    })
    .default({ infant: 0, toddler: 0, booster: 0 }),
  luggage: z
    .object({
      standard: z.number().int().min(0).max(20).default(0),
      heavy: z.number().int().min(0).max(20).default(0),
    })
    .default({ standard: 0, heavy: 0 }),
});

export async function quote(req, res) {
  const quoteResult = await quoteFare(req.body);
  res.json(quoteResult);
}
