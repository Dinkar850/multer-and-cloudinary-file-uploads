const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema(
  {
    url: {
      //file upload
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    uploadedBy: {
      //to know which user is uploading this file
      type: mongoose.Schema.Types.ObjectId, //kind of like foreign key
      ref: "User",
      required: true,
    },
  },
  { timeStamps: true }
);

module.exports = mongoose.model("Image", ImageSchema);
