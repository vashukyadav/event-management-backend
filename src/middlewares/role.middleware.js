// Vendor-only access
export const isVendor = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "vendor") {
      return res.status(403).json({
        message: "Access denied. Vendor only.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};

// User-only access
export const isUser = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== "user") {
      return res.status(403).json({
        message: "Access denied. User only.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
    });
  }
};
