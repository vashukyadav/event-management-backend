import express from "express";
import {
  createVendorPackage,
  getVendorPackages
} from "../controllers/package.controller.js";



import { protect } from "../middlewares/auth.middleware.js";
import upload  from "../middlewares/multer.middleware.js";

const router = express.Router();

// ================= PACKAGE =================

// Vendor creates package
router.post("/", protect, upload.array("image",5), createVendorPackage);

// Vendor gets own packages
router.get("/vendor", protect, getVendorPackages);

// ================= BOOKINGS (VENDOR) =================



export default router;
