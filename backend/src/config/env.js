import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  ALLOWED_ORIGINS: z.string().default("*"),

  MONGO_URI: z.string().min(1, "MONGO_URI is required"),

  JWT_SECRET: z.string().min(32, "JWT_SECRET must be >= 32 chars"),
  JWT_EXPIRES_IN: z.string().default("7d"),

  STRIPE_SECRET_KEY: z.string().min(1, "STRIPE_SECRET_KEY is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "STRIPE_WEBHOOK_SECRET is required"),

  MAPBOX_ACCESS_TOKEN: z.string().min(1, "MAPBOX_ACCESS_TOKEN is required"),

  // ----- Brevo (transactional email + SMS) -----
  // All optional. When BREVO_API_KEY is empty, email sending is a no-op
  // and the booking endpoint still works. See docs/email.md.
  BREVO_API_KEY: z.string().optional(),
  BREVO_FROM_NAME: z.string().default('SEBCO Travels'),
  BREVO_FROM_EMAIL: z.string().email().default('bookings@sebcotravels.co.uk'),
  BREVO_OPERATOR_EMAIL: z.string().email().optional(),
  BREVO_SMS_ENABLED: z
    .union([z.literal('true'), z.literal('false'), z.boolean()])
    .default('false')
    .transform((v) => v === true || v === 'true'),
  BREVO_OPERATOR_PHONE: z.string().optional(),
  BREVO_SITE_ORIGIN: z.string().url().default('http://localhost:3000'),

  // Per-vehicle pricing. Car is a smaller sedan (4 pax, cheaper to run),
  // van is the 8-seat MPV. Tuned to stay competitive with the UK executive car market on
  // the same distance while still giving the operator a healthy margin.
  FARE_BASE_CAR:  z.coerce.number().nonnegative().default(3.00),
  FARE_PER_MILE_CAR: z.coerce.number().nonnegative().default(2.40),
  FARE_BASE_VAN:  z.coerce.number().nonnegative().default(5.00),
  FARE_PER_MILE_VAN: z.coerce.number().nonnegative().default(2.80),

  // Legacy single-class vars — kept so the /pricing endpoint still
  // returns sane numbers if you forget to set the per-vehicle ones.
  FARE_BASE: z.coerce.number().nonnegative().default(4),
  FARE_PER_MILE: z.coerce.number().nonnegative().default(2.2),

  FARE_CURRENCY: z.string().toLowerCase().default("gbp"),
  FARE_ADDON_INFANT_SEAT: z.coerce.number().nonnegative().default(2),
  FARE_ADDON_TODDLER_SEAT: z.coerce.number().nonnegative().default(2),
  FARE_ADDON_BOOSTER_SEAT: z.coerce.number().nonnegative().default(2),
  FARE_ADDON_HEAVY_LUGGAGE: z.coerce.number().nonnegative().default(1),

  DISPATCH_TIMEOUT_MS: z.coerce.number().int().positive().default(30_000),
  DISPATCH_SEARCH_RADIUS_METERS: z.coerce.number().int().positive().default(15_000),
  DISPATCH_MAX_ATTEMPTS: z.coerce.number().int().positive().default(10),
  DRIVER_LOCATION_PERSIST_MS: z.coerce.number().int().positive().default(3_000),

  REDIS_URL: z.string().optional(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  // Print a readable error and exit. Do NOT continue with bad config.
  const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
  console.error(`Invalid environment configuration:\n${issues}`);
  process.exit(1);
}

export const env = Object.freeze(parsed.data);

export const allowedOrigins = env.ALLOWED_ORIGINS === "*"
  ? "*"
  : env.ALLOWED_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
