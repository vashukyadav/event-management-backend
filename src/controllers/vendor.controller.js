import  Vendor  from "../models/vendor_schema.js";
import  Booking  from "../models/booking_schema.js";
import  Package  from "../models/package_schema.js";

export const getVendorProfile = async (req, res) => {
    try {
       
        const vendorId = req.user.id;

        const vendor = await Vendor.findById(vendorId).select("-password");

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found",
            });
        }

        return res.status(200).json({
            message: "Vendor profile fetched successfully",
            vendor,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
};


export const updateVendorProfile = async (req, res) => {
    try {
        const vendorId = req.user.id;

        
        const {
            ownerName,
            businessName,
            services,
            city,
            experience
        } = req.body;

        const updateData = {
            ownerName,
            businessName,
            services,
            city,
            experience
        };

        const vendor = await Vendor.findByIdAndUpdate(
            vendorId,
            updateData,
            { new: true }
        ).select("-password");

        if (!vendor) {
            return res.status(404).json({
                message: "Vendor not found",
            });
        }

        return res.status(200).json({
            message: "Vendor profile updated successfully",
            vendor,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};


export const createVendorPackage = async (req, res) => {
    try {
        const vendorId = req.user.id;

        const {
            title,
            eventType,
            price,
            includes,
            images,
            maxBudget
        } = req.body;

        
        if (!title || !eventType || !price) {
            return res.status(400).json({
                message: "Required fields are missing",
            });
        }

        if (price <= 0) {
            return res.status(400).json({
                message: "Price must be greater than 0",
            });
        }

        const newPackage = await Package.create({
            vendor: vendorId,
            title,
            eventType,
            price,
            includes,
            images,
            maxBudget,
        });

        return res.status(201).json({
            message: "Vendor package created successfully",
            package: newPackage,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};


export const getVendorPackages = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const packages = await Package
      .find({ vendor: vendorId })
      .sort({ createdAt: -1 });

    if (!packages || packages.length === 0) {
      return res.status(200).json({
        message: "No packages found for this vendor",
        packages: [],
      });
    }

    return res.status(200).json({
      message: "Vendor packages fetched successfully",
      packages,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};


export const viewVendorBookings = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const bookings = await Booking.find({ vendor: vendorId })
      .populate("user", "name email")
      .populate("package", "title price")
      .sort({ createdAt: -1 });

    if (!bookings || bookings.length === 0) {
      return res.status(200).json({
        message: "No bookings found for this vendor",
        bookings: [],
      });
    }

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



export const acceptRejectBooking = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const { bookingId } = req.params;
    const { action } = req.body; 
    
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

   
    if (booking.vendor.toString() !== vendorId) {
      return res.status(403).json({
        message: "You are not allowed to update this booking",
      });
    }

    
    if (booking.status !== "pending") {
      return res.status(400).json({
        message: "Booking already processed",
      });
    }

    
    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({
        message: "Invalid action",
      });
    }

   
    booking.status = action === "accept" ? "accepted" : "rejected";
    await booking.save();

    return res.status(200).json({
      message: `Booking ${booking.status} successfully`,
      booking,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
