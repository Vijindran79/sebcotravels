import { Router } from "express";
import { requireAuth, requireRole, UserRole } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  upsertProfile,
  patchInventory,
  updateStatus,
  getMyProfile,
  profileSchema,
  inventoryPatchSchema,
  statusSchema,
} from "../controllers/drivers.controller.js";

const router = Router();

router.use(requireAuth, requireRole(UserRole.DRIVER, UserRole.ADMIN));

router.get("/me", getMyProfile);
router.post("/profile", validate({ body: profileSchema }), upsertProfile);
router.patch("/inventory", validate({ body: inventoryPatchSchema }), patchInventory);
router.patch("/status", validate({ body: statusSchema }), updateStatus);

export default router;
