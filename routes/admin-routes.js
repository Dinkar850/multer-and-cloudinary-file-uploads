const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const isAdminUser = require("../middlewares/admin-middleware");
const router = express.Router();

router.get("/welcome", authMiddleware, isAdminUser, (req, res) => {
  res.json({
    message: "Welcome to admin home page",
  });
});

module.exports = router;
