import  Vendor  from "../models/vendor_schema.js";
import  Package  from "../models/package_schema.js";
import  Booking  from "../models/booking_schema.js";

export const getVendorBookings = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const bookings = await Booking.find({ vendor: vendorId })
      .populate("user", "name email")
      .populate("package", "title price")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Vendor bookings fetched successfully",
      bookings,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updateBookingStatus = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { bookingId } = req.params;
    const { status } = req.body; // accepted / rejected

    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      vendor: vendorId,
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
