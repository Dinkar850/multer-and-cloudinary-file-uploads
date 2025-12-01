## Contents

- [Password change](#1-change-password)
- [Deleting an image](#2-delete-image-functionality)
- [Pagination for fetched images](#3-pagination-for-fetching-images-at-a-time)

## 1. Change password

- `changePassword` controller setup

```js
const changePassword = async (req, res) => {
  try {
    const userId = req.userInfo.userId;

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Missing old or new password",
      });
    }

    if (oldPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "Cannot have entered password same as old password",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
      return res.status(403).json({
        success: false,
        message: "Password entered does not match the current user password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = newHashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (e) {
    console.error("Error logging in user", e);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};
```

- setting up route:

```js
router.post("/change-password", authMiddleware, changePassword);
```

## 2. Delete image functionality

```js
const deleteImage = async (req, res) => {
  try {
    const idDeletedImage = req.params.id;
    const userId = req.userInfo.userId;

    const image = await Image.findById(idDeletedImage);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image to be deleted not found",
      });
    }

    //find user who created that image and check if its the same user who is trying to delete it or not
    const uploaderId = image.uploadedBy.toString();
    if (uploaderId !== userId) {
      return res.status(403).json({
        success: false,
        message: "Only user who uploaded the image is allowed to delete it",
      });
    }

    //before deleting from db delete from cloudinary first
    await cloudinary.uploader.destroy(image.publicId);

    //delete from mongodb database
    await Image.findByIdAndDelete(idDeletedImage);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = { uploadImage, fetchImages, deleteImage };
```

- route:

```js
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

//delete image
router.delete("/delete/:id", authMiddleware, adminMiddleware, deleteImage);

// get all the images

module.exports = router;
```

## 3. Pagination for fetching images at a time

```js
const fetchImages = async (req, res) => {
  try {
    const page = +req.query.page || 1; //the page you want to see
    const limit = +req.query.limit || 5; //images per page
    const skip = (page - 1) * limit; //amount of images to skip for the pages before the requested page
    const sortBy = req.query.sortBy || "createdAt";
    const sortOrder = req.query.sortOrder === "asc" ? 1 : -1;
    const totalImages = await Image.countDocuments({});
    const totalPages = Math.ceil(totalImages / limit);

    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    const images = await Image.find().sort(sortObj).skip(skip).limit(limit);

    if (!images) {
      return res.statuts(500).json({
        success: false,
        message: "Something went wrong",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Images fetched successfully",
      currentPage: page,
      totalPages,
      totalImages,
      data: images,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};
```
