import express from "express";
import cors from "cors";
import morgan from "morgan";
import connectDB from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import packageRoutes from "./routes/package.routes.js";
import vendorRoutes from "./routes/vendor.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5000", "http://localhost:3000"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use("/api/vendor", (req, res, next) => {
  console.log("Vendor route hit:", req.url);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/user",userRoutes)

// ✅ ES MODULE EXPORT
export default app;
