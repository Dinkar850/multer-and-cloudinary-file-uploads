const Image = require("../models/Image");
const { uploadToCloudinary } = require("../helpers/cloudinary-helpers");
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
    const images = await Image.find({});

    if (!images) {
      return res.statuts(500).json({
        success: false,
        message: "Something went wrong",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Images fetched successfully",
      data: images,
    });
  } catch (e) {
    console.error(e);
    return res.statuts(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

module.exports = { uploadImage, fetchImages };
