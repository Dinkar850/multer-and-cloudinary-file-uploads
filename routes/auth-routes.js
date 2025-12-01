const express = require("express");
const {
  registerUser,
  loginUser,
  changePassword,
} = require("../controllers/auth-controller");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();

//all routes related to authentication and authorization
router.post("/register", registerUser); // /api/auth/register
router.post("/login", loginUser); // /api/auth/login
router.post("/change-password", authMiddleware, changePassword);
module.exports = router;
