import  Vendor  from "../models/vendor_schema.js";
import  Package  from "../models/package_schema.js";
import cloudinary from "../config/cloudinary.js";
// import { Booking } from "../models/booking_schema.js";


export const getVendorProfile = async (req, res) => {
  try {
    // token se vendor id aayegi
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


// import { Vendor } from "../models/vendor.model.js";

export const updateVendorProfile = async (req, res) => {
  try {
    const vendorId = req.user.id;

    // Allowed fields only (security)
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
      maxBudget
    } = req.body;

    if (!title || !eventType || !price || !maxBudget) {
      return res.status(400).json({
        message: "Required fields are missing",
      });
    }
       let imageUrls = [];
     if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadResult = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          {
            folder: "event_packages",
          }
        );

        imageUrls.push(uploadResult.secure_url);
      }
    }

    const newPackage = await Package.create({
      vendorId: vendorId,   // ✅ MATCH SCHEMA
      title,
      eventType,
      price,
      includes,
      maxBudget,
      images:imageUrls,
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
      .find({ vendorId: vendorId })   // ✅ FIX
      .sort({ createdAt: -1 });

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


