import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  createBooking,
  getUserBookings,
  getVendorBookings,
  updateBookingStatus,
  cancelBooking,
} from "../controllers/booking.controller.js";

const router = express.Router();

// User creates booking
router.post("/", protect, createBooking);

// User gets own bookings
router.get("/user", protect, getUserBookings);

// Vendor gets bookings
router.get("/vendor", protect, getVendorBookings);

// Vendor accepts/rejects booking
router.put("/:bookingId/status", protect, updateBookingStatus);

// User cancels booking
router.put("/:bookingId/cancel", protect, cancelBooking);

export default router;
