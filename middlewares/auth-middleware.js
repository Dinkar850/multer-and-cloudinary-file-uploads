const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      success: false,
      message:
        "Access denied, no token found. Please login to access this page",
    });
  }

  //decode this token now
  try {
    const decodedTokenInfo = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.userInfo = decodedTokenInfo;
    next(); //otherwise we allow to go no next and access the page
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "Error verifying user",
    });
  }
};

module.exports = authMiddleware;
