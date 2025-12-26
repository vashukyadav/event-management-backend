import express from "express";
import { getVendorProfile, updateVendorProfile } from "../controllers/vendor.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { isVendor } from "../middlewares/role.middleware.js";

const router = express.Router();

router.get("/profile", protect,isVendor, getVendorProfile);
router.put("/profile", protect,isVendor, updateVendorProfile);

export default router;
