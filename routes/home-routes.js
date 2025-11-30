const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();

router.get("/welcome", authMiddleware, (req, res) => {
  const user = req.userInfo;
  res.json({
    message: "Welcome to home page",
    user: {
      id: user.userId,
      username: user.username,
      role: user.role,
    }, //used for passing to frontend
  });
});

module.exports = router;
