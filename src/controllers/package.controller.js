import Vendor from "../models/vendor_schema.js";
import Package from "../models/package_schema.js";
import cloudinary from "../config/cloudinary.js";

/* ================= VENDOR PROFILE ================= */

export const getVendorProfile = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.user.id).select("-password");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({
      message: "Vendor profile fetched successfully",
      vendor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateVendorProfile = async (req, res) => {
  try {
    const { ownerName, businessName, services, city, experience } = req.body;

    const vendor = await Vendor.findByIdAndUpdate(
      req.user.id,
      {
        ownerName,
        businessName,
        city,
        experience,
        services: services
          ? services.split(",").map((s) => s.trim())
          : [],
      },
      { new: true }
    ).select("-password");

    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    res.status(200).json({
      message: "Vendor profile updated successfully",
      vendor,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= CREATE PACKAGE ================= */

export const createVendorPackage = async (req, res) => {
  try {
    const { title, eventType, price, includes, maxBudget } = req.body;

    if (!title || !eventType || !price || !maxBudget || !includes) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    const includesArray = includes.split(",").map((i) => i.trim());

    const imageUrls = [];

    if (req.files?.length) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "event_packages" }
        );
        imageUrls.push(result.secure_url);
      }
    }

    const pkg = await Package.create({
      vendorId: req.user.id,
      title,
      eventType,
      price: Number(price),
      includes: includesArray,
      minBudget: Number(price),
      maxBudget: Number(maxBudget),
      images: imageUrls,
    });

    res.status(201).json({
      message: "Vendor package created successfully",
      package: pkg,
    });
  } catch (error) {
    console.error("Create package error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= VENDOR PACKAGES ================= */

export const getVendorPackages = async (req, res) => {
  try {
    const packages = await Package.find({ vendorId: req.user.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Vendor packages fetched successfully",
      packages,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= PUBLIC PACKAGES ================= */

export const getPublicPackages = async (req, res) => {
  try {
    const packages = await Package.find()
      .populate({
        path: "vendorId",
        match: { isApproved: true },
        select: "businessName city",
      })
      .sort({ createdAt: -1 });

    const filteredPackages = packages.filter(p => p.vendorId);

    res.status(200).json({
      message: "Public packages fetched successfully",
      packages: filteredPackages,
    });
  } catch (error) {
    console.error("getPublicPackages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export const getPackageById = async (req, res) => {
  try {
    const { id } = req.params;

    const pkg = await Package.findById(id)
      .populate("vendorId", "businessName city");

    if (!pkg) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    return res.status(200).json({
      message: "Package fetched successfully",
      package: pkg,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

export const updatePackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, eventType, price, maxBudget, includes } = req.body;

    const pkg = await Package.findById(id);
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    if (pkg.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    pkg.title = title || pkg.title;
    pkg.eventType = eventType || pkg.eventType;
    pkg.price = price || pkg.price;
    pkg.maxBudget = maxBudget || pkg.maxBudget;
    pkg.includes = includes ? includes.split(",").map(i => i.trim()) : pkg.includes;

    await pkg.save();

    return res.status(200).json({
      message: "Package updated successfully",
      package: pkg,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deletePackage = async (req, res) => {
  try {
    const { id } = req.params;

    const pkg = await Package.findById(id);
    if (!pkg) {
      return res.status(404).json({ message: "Package not found" });
    }

    if (pkg.vendorId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await Package.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Package deleted successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
