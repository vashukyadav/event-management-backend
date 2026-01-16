// import { use } from "react";
import Package  from "../models/package_schema.js";
import  Vendor from "../models/vendor_schema.js";
import Booking  from "../models/booking_schema.js";
import User from "../models/user_schema.js";
import bcrypt from "bcryptjs";

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      message: "User profile fetched successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const browsePackages = async (req, res) => {
  try {
    const { city, eventType, budget } = req.query;

    let vendorFilter = { isApproved: true };
    if (city) vendorFilter.city = city;

    const vendors = await Vendor.find(vendorFilter).select("_id");
    const vendorIds = vendors.map(v => v._id);

    let packageFilter = {
      vendor: { $in: vendorIds },
    };

    if (eventType) packageFilter.eventType = eventType;
    if (budget) packageFilter.price = { $lte: Number(budget) };

    const packages = await Package.find(packageFilter)
      .populate("vendor", "businessName city services")
      .sort({ price: 1 });

    return res.status(200).json({
      message: "Packages fetched successfully",
      total: packages.length,
      packages,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};



export const getPackageDetail = async (req, res) => {
    try {
        const { packageId } = req.params;

        if (!packageId) {
            return res.status(400).json({ message: "Package ID is required" });
        }

        const pkg = await Package.findById(packageId)
            .populate("vendor", "businessName city services experience")
            .exec();

        if (!pkg) {
            return res.status(404).json({ message: "Package not found" });
        }

        return res.status(200).json({
            message: "Package detail fetched successfully",
            package: pkg,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};




// import Booking from "../models/booking_schema.js";


// User creates booking
export const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { packageId, eventDate } = req.body;

    if (!packageId || !eventDate) {
      return res.status(400).json({
        message: "Package ID and event date are required",
      });
    }

    const selectedDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        message: "Event date cannot be in the past",
      });
    }

    const packageData = await Package.findById(packageId).populate("vendorId");
    if (!packageData) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    const vendorId = packageData.vendorId._id;

    // ❗ Check vendor availability (only accepted bookings block)
    const alreadyBooked = await Booking.findOne({
      vendorId,
      eventDate: selectedDate,
      status: "accepted",
    });

    if (alreadyBooked) {
      return res.status(409).json({
        message: "Vendor already booked on this date",
      });
    }

    const booking = await Booking.create({
      userId,
      vendorId,
      packageId,
      eventDate: selectedDate,
      totalAmount: packageData.price,
      status: "pending",
    });

    return res.status(201).json({
      message: "Booking request sent successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};




export const getUserBookingHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ userId })
      .populate("packageId", "title price eventType")
      .populate("vendorId", "businessName city")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "User booking history fetched successfully",
      total: bookings.length,
      bookings,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Both current and new password are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
