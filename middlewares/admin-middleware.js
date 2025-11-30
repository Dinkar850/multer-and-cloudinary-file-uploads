const isAdminUser = (req, res, next) => {
  if (req.userInfo.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Requires admin rights to access this page",
    });
  }

  next();
};

module.exports = isAdminUser;
