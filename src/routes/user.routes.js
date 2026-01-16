import express from "express";
import {
  getUserProfile,
  browsePackages,
  getPackageDetail,
  createBooking,
  getUserBookingHistory,
  changePassword,
} from "../controllers/user.controller.js";

import { protect } from "../middlewares/auth.middleware.js";
import { isUser } from "../middlewares/role.middleware.js";

const router = express.Router();

// 👤 User profile
router.get("/profile", protect, isUser, getUserProfile);

// 🔒 Change password
router.put("/change-password", protect, isUser, changePassword);

// 🔍 Browse packages
router.get("/packages", protect, browsePackages);

// 📦 Package detail
router.get("/packages/:packageId", protect, getPackageDetail);

// 📝 Create booking
router.post("/bookings", protect, isUser, createBooking);

// 📜 Booking history
router.get("/bookings", protect, isUser, getUserBookingHistory);

export default router;
