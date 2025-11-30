const multer = require("multer");
const path = require("path");

//set the multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); //where i want to upload, in the uploads folder, make one as well
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  }, //this is the filename of the file that will be stored in the uploads directory, unique
  //cb is nodejs callback with first arg as error, here it means: "Call callback with no error, and the next parameter is the actual value" and fieldname is image or photo or video etc, what we give in our form so the filename wud be "image-1213131.ext"
});

//add some file filter function (only accept images for uploads)
const checkFileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an Image!, please upload an image only"));
  }
};

//multer uses callback based file uploading as its immediate and was built before promises and its good for streaming coz promises need to wait but callback execution is instant
// cb(null, some_var) says that no error continue and immediately continue the next steps as callback says
//cb(new error) says abort upload as error occured

//create final multer middleware for file uploading
module.exports = multer({
  storage,
  fileFilter: checkFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, //5 MB
  },
});
//takes in first the storage, a filter, then limit
