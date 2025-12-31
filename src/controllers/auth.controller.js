import bcrypt from "bcryptjs";
import User from "../models/user_schema.js";
import Vendor from "../models/vendor_schema.js";
import { generateToken } from "../utils/jwt.js";

// ================= REGISTER =================
export const register = async (req, res) => {
  try {
    const { role } = req.body;

    // ---------- USER REGISTER ----------
    if (role === "user") {
      const { name, email, password, city, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          message: "Name, email and password are required",
        });
      }

      const existingUser = await User.findOne({
        email: email.toLowerCase(),
      });

      if (existingUser) {
        return res.status(400).json({
          message: "User already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        city,
        phone,
      });

      return res.status(201).json({
        message: "User registered successfully",
        userId: user._id,
      });
    }

    // ---------- VENDOR REGISTER ----------
    if (role === "vendor") {
      const {
        ownerName,
        businessName,
        email,
        password,
        services,
        city,
        experience,
      } = req.body;

      if (!ownerName || !businessName || !email || !password) {
        return res.status(400).json({
          message: "All required fields must be provided",
        });
      }

      const existingVendor = await Vendor.findOne({
        email: email.toLowerCase(),
      });

      if (existingVendor) {
        return res.status(400).json({
          message: "Vendor already exists",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const vendor = await Vendor.create({
        ownerName,
        businessName,
        email: email.toLowerCase(),
        password: hashedPassword,
        services: services
          ? services.split(",").map((s) => s.trim())
          : [],
        city,
        experience,
      });

      return res.status(201).json({
        message: "Vendor registered successfully (awaiting approval)",
        vendorId: vendor._id,
      });
    }

    return res.status(400).json({
      message: "Invalid role",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// ================= LOGIN =================
export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    let account;

    if (role === "user") {
      account = await User.findOne({ email: email.toLowerCase() });
    } else if (role === "vendor") {
      account = await Vendor.findOne({ email: email.toLowerCase() });

      if (account && !account.isApproved) {
        return res.status(403).json({
          message: "Vendor account not approved yet",
        });
      }
    } else {
      return res.status(400).json({
        message: "Invalid role",
      });
    }

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = generateToken({
      id: account._id,
      role: account.role,
    });

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: account._id,
        role: account.role,
        name: account.name || account.businessName,
        email: account.email,
        city: account.city,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
    });
  }
};
