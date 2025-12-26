// import { use } from "react";
import Package  from "../models/package_schema.js";
import  Vendor from "../models/vendor_schema.js";

export const getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password);");
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            })
        }
        return res.status(200).json({
            message: "User  profile fetched successfully",
            user,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error",
        });
    }
};

export const browsePackages = async (req, res) => {
    try {
        const { city, eventType, budget } = req.query;


        if (!city || !eventType || !budget) {
            return res.status(400).json({
                message: "City, eventType and budget are required",
            });
        }


        const vendors = await Vendor.find({
            city: city,
            isApproved: true,
        }).select("_id");

        const vendorIds = vendors.map(v => v._id);


        const packages = await Package.find({
            vendor: { $in: vendorIds },
            eventType: eventType,
            price: { $lte: Number(budget) },
        })
            .populate("vendor", "businessName city services")
            .sort({ price: 1 });


        if (!packages || packages.length === 0) {
            return res.status(200).json({
                message: "No packages found for given filters",
                packages: [],
            });
        }

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




export const createBooking = async (req, res) => {
    try {
        const userId = req.user.id;
        const { packageId, eventDate } = req.body;

        if (!packageId || !eventDate) {
            return res.status(400).json({
                message: "Package ID and event date are required",
            });
        }


        const pkg = await Package.findById(packageId).populate("vendor");
        if (!pkg) {
            return res.status(404).json({ message: "Package not found" });
        }


        const selectedDate = new Date(eventDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (selectedDate < today) {
            return res.status(400).json({
                message: "Event date cannot be in the past",
            });
        }


        const alreadyBooked = await Booking.findOne({
            vendor: pkg.vendor._id,
            eventDate: selectedDate,
            status: "accepted",
        });

        if (alreadyBooked) {
            return res.status(409).json({
                message: "Vendor already booked on this date",
            });
        }


        const booking = await Booking.create({
            user: userId,
            vendor: pkg.vendor._id,
            package: pkg._id,
            eventDate: selectedDate,
            status: "pending",
            totalAmount: pkg.price,
        });

        return res.status(201).json({
            message: "Booking request sent successfully",
            booking,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};




export const getUserBookingHistory = async (req, res) => {
    try {
        // 🔐 token se userId
        const userId = req.user.id;

        // 📦 user ki saari bookings nikalo
        const bookings = await Booking.find({ user: userId })
            .populate("package", "title price eventType")
            .populate("vendor", "businessName city")
            .sort({ createdAt: -1 }); // latest first

        // ❗ agar koi booking nahi hai
        if (!bookings || bookings.length === 0) {
            return res.status(200).json({
                message: "No bookings found",
                bookings: [],
            });
        }

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


