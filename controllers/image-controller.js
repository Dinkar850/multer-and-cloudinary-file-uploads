const Image = require("../models/Image");
const { uploadToCloudinary } = require("../helpers/cloudinary-helpers");
const cloudinary = require("../config/cloudinary-config");
const fs = require("fs");

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file not found, please upload an image",
      });
    }

    //uploading to cloudinary
    const { url, publicId } = await uploadToCloudinary(req.file.path);

    //storing in mongo in Image model along with uploaded user id
    const newlyUploadedImage = await Image.create({
      url,
      publicId,
      uploadedBy: req.userInfo.userId, //i guess we will be passing the auth-middleware in this route and from req.userInfo set by the middleware we will get the uploader's user id
    });

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully",
      image: newlyUploadedImage,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Something went wrong, try again",
    });
  }
};

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
