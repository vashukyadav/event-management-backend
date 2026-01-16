import express from "express";
import {
  createVendorPackage,
  getVendorPackages, getPublicPackages,
  getPackageById
} from "../controllers/package.controller.js";



import { protect } from "../middlewares/auth.middleware.js";
import upload  from "../middlewares/multer.middleware.js";

const router = express.Router();

// ================= PACKAGE =================

// Vendor creates package
router.post("/", (req, res, next) => {
  console.log("Package route hit");
  next();
}, protect, upload.array("images",5), createVendorPackage);

// Vendor gets own packages (MUST be before /:id route)
router.get("/vendor", protect, getVendorPackages);

router.get("/public", getPublicPackages);
router.get("/:id", getPackageById); 

// ================= BOOKINGS (VENDOR) =================



export default router;
