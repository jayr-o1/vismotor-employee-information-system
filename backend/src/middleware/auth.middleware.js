const jwt = require("jsonwebtoken");
const db = require("../database");
const { JWT_SECRET } = require('../config/jwt');

/**
 * Middleware to validate JWT token
 */
const validateToken = (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("No Authorization header or not in Bearer format");
      return res.status(401).json({
        success: false,
        message: "Authentication required. No token provided."
      });
    }

    // Extract the token without the Bearer prefix
    const token = authHeader.split(" ")[1];
    
    if (!token || token === "null" || token === "undefined") {
      console.log("Invalid token format:", token);
      return res.status(401).json({
        success: false,
        message: "Invalid token format."
      });
    }

    // Verify the token
    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log("JWT verification error:", err.name, err.message);
        
        // Provide specific error message based on the type of error
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: "Token has expired. Please log in again.",
            code: "TOKEN_EXPIRED"
          });
        } else if (err.name === 'JsonWebTokenError') {
          return res.status(401).json({
            success: false,
            message: "Invalid token. Please log in again.",
            code: "INVALID_TOKEN"
          });
        } else {
          return res.status(401).json({
            success: false,
            message: "Invalid or expired token."
          });
        }
      }

      // Check if user exists
      try {
        const user = await db('users')
          .select('id', 'email', 'first_name', 'last_name', 'role', 'is_verified')
          .where({ id: decoded.userId })
          .first();

        if (!user) {
          console.log("User not found for token user ID:", decoded.userId);
          return res.status(401).json({
            success: false,
            message: "User associated with token no longer exists.",
            code: "USER_NOT_FOUND"
          });
        }

        // Attach user to request object, combining first and last name for compatibility
        req.user = {
          ...user,
          name: `${user.first_name} ${user.last_name}`
        };
        next();
      } catch (error) {
        console.error("Database error in auth middleware:", error);
        return res.status(500).json({
          success: false,
          message: "Server error while authenticating user."
        });
      }
    });
  } catch (error) {
    console.error("Error in validateToken middleware:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during authentication."
    });
  }
};

/**
 * Middleware to ensure the user is verified
 */
const ensureVerified = (req, res, next) => {
  if (!req.user.is_verified) {
    return res.status(403).json({
      success: false,
      message: "Email verification required. Please verify your email before proceeding.",
      code: "EMAIL_NOT_VERIFIED"
    });
  }
  next();
};

/**
 * Middleware to ensure the user has admin role
 */
const isAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'it_admin' && req.user.role !== 'hr_admin')) {
    return res.status(403).json({
      success: false,
      message: "Admin access required for this operation.",
      code: "ADMIN_REQUIRED"
    });
  }
  next();
};

/**
 * Middleware to ensure the user has HR admin role
 */
const isHrAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'hr_admin') {
    return res.status(403).json({
      success: false,
      message: "HR Admin access required for this operation.",
      code: "HR_ADMIN_REQUIRED"
    });
  }
  next();
};

/**
 * Middleware to ensure the user has IT admin role
 */
const isItAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'it_admin') {
    return res.status(403).json({
      success: false,
      message: "IT Admin access required for this operation.",
      code: "IT_ADMIN_REQUIRED"
    });
  }
  next();
};

module.exports = {
  validateToken,
  ensureVerified,
  isAdmin,
  isHrAdmin,
  isItAdmin
}; 