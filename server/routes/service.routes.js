import express from "express";
import {
  createService,
  deleteService,
  getServiceById,
  getServices,
  toggleServiceActive,
  updateService,
} from "../controllers/service.controller.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, createService);
router.get("/", isAuthenticated, getServices);
router.get("/:id", isAuthenticated, getServiceById);
router.patch("/:id", isAuthenticated, updateService);
router.delete("/:id", isAuthenticated, deleteService);
// router.patch("/:id/toggle-active", toggleServiceActive);

export default router;
