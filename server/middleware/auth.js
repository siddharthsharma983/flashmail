const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT Token
 * Checks for 'x-auth-token' in the request header
 */
module.exports = function (req, res, next) {
  // Get token from the request header
  const token = req.header("x-auth-token");

  // If no token, deny access
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user ID from payload to the request object
    req.user = decoded.id;

    // Move to the next function/controller
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
