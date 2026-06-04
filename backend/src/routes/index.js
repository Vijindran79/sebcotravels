import { Router } from "express";
import authRoutes from "./auth.routes.js";
import driversRoutes from "./drivers.routes.js";
import pricingRoutes from "./pricing.routes.js";
import bookingsRoutes from "./bookings.routes.js";
import leadsRoutes from "./leads.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/drivers", driversRoutes);
router.use("/pricing", pricingRoutes);
router.use("/bookings", bookingsRoutes);
router.use("/leads", leadsRoutes);

export default router;
