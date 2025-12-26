import mongoose from "mongoose";

const vendorSchema = new mongoose.Schema(
  {
    ownerName: {
      type: String,
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["vendor"],
      default: "vendor",
    },
    services: {
      type: [String], 
    },
    city: {
      type: String,
    },
    experience: {
      type: Number,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
