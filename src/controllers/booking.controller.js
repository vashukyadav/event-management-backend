import Vendor from "../models/vendor_schema.js";
import Package from "../models/package_schema.js";
import Booking from "../models/booking_schema.js";

// Create booking (User)
export const createBooking = async (req, res) => {
  try {
    console.log("Booking request received:", req.body);
    console.log("User ID:", req.user?.id);
    
    const userId = req.user.id;
    const { packageId, eventDate } = req.body;

    if (!packageId || !eventDate) {
      return res.status(400).json({
        message: "Package ID and event date are required",
      });
    }

    // Check if date is in future
    const selectedDate = new Date(eventDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return res.status(400).json({
        message: "Event date cannot be in the past",
      });
    }

    // Check if package exists
    const packageData = await Package.findById(packageId).populate('vendorId');
    if (!packageData) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    const vendorId = packageData.vendorId._id;

    // Check vendor availability on that date
    const existingBooking = await Booking.findOne({
      vendorId: vendorId,
      eventDate: selectedDate,
      status: 'accepted'
    });

    if (existingBooking) {
      return res.status(400).json({
        message: "Vendor is not available on this date",
      });
    }

    // Create booking
    const booking = await Booking.create({
      userId,
      vendorId,
      packageId,
      eventDate: selectedDate,
      totalAmount: packageData.price,
      status: 'pending'
    });

    return res.status(201).json({
      message: "Booking request sent successfully",
      booking,
    });

  } catch (error) {
    console.error("Booking creation error:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get user bookings
export const getUserBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const bookings = await Booking.find({ userId })
      .populate("packageId", "title eventType price")
      .populate("vendorId", "businessName")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "User bookings fetched successfully",
      bookings,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Get vendor bookings
export const getVendorBookings = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const bookings = await Booking.find({ vendorId })
      .populate("userId", "name email")
      .populate("packageId", "title price")
      .sort({ createdAt: -1 });

    // Transform data to match frontend expectations
    const transformedBookings = bookings.map(booking => ({
      ...booking.toObject(),
      user: booking.userId, // Map userId to user for frontend compatibility
      package: booking.packageId // Map packageId to package for frontend compatibility
    }));

    return res.status(200).json({
      message: "Vendor bookings fetched successfully",
      bookings: transformedBookings,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Update booking status (Vendor)
export const updateBookingStatus = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      vendorId: vendorId,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    booking.status = status;
    await booking.save();

    return res.status(200).json({
      message: `Booking ${status} successfully`,
      booking,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// Cancel booking (User)
export const cancelBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      userId: userId,
    });

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    if (booking.status === "accepted") {
      return res.status(400).json({
        message: "Cannot cancel an accepted booking. Please contact vendor.",
      });
    }

    if (booking.status === "cancelled") {
      return res.status(400).json({
        message: "Booking is already cancelled",
      });
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully",
      booking,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};