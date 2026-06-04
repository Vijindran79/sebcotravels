import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { quote, quoteSchema } from "../controllers/pricing.controller.js";

const router = Router();

router.post("/quote", requireAuth, validate({ body: quoteSchema }), quote);

export default router;
