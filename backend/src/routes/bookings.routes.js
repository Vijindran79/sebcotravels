import { Router } from "express";
import { requireAuth, requireRole, UserRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  createBooking,
  getBooking,
  cancelBooking,
  advanceBooking,
  listMyBookings,
  createBookingSchema,
} from "../controllers/bookings.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/", listMyBookings);
router.post(
  "/",
  requireRole(UserRole.PASSENGER, UserRole.ADMIN),
  validate({ body: createBookingSchema }),
  createBooking
);
router.get("/:id", getBooking);
router.post(
  "/:id/cancel",
  requireRole(UserRole.PASSENGER, UserRole.ADMIN),
  cancelBooking
);
router.post(
  "/:id/advance",
  requireRole(UserRole.DRIVER, UserRole.ADMIN),
  advanceBooking
);

export default router;
