const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const adminMiddleware = require("../middlewares/admin-middleware");
const uploadMiddleware = require("../middlewares/upload-middleware");
const {
  uploadImage,
  fetchImages,
  deleteImage,
} = require("../controllers/image-controller");
const router = express.Router();

//upload image
router.post(
  "/upload",
  authMiddleware,
  adminMiddleware,
  uploadMiddleware.single("image"),
  uploadImage
); //.single means not many files just a single image

//fetch images
router.get("/fetchAll", authMiddleware, fetchImages);

//delete image
router.delete("/delete/:id", authMiddleware, adminMiddleware, deleteImage);

// get all the images

module.exports = router;
