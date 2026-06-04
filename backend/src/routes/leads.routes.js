import { Router } from "express";
import rateLimit from "express-rate-limit";
import { validate } from "../middleware/validate.js";
import { createLead, createLeadSchema } from "../controllers/leads.controller.js";

const router = Router();

// Tight rate limit: this endpoint is public + unauthenticated, so it is a
// prime target for spam. 5 leads / minute / IP is plenty for a real person.
const leadLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/", leadLimiter, validate({ body: createLeadSchema }), createLead);

export default router;
