import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getVendorBookings,
  updateBookingStatus
} from "../controllers/booking.controller.js";

const router = express.Router();

// Vendor gets bookings
router.get("/vendor/bookings", protect, getVendorBookings);

// Vendor accepts / rejects booking
router.put(
  "/vendor/bookings/:bookingId/status",
  protect,
  updateBookingStatus
);

export default router;
