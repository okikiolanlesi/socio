const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const ApiFeatures = require("../utils/ApiFeatures");
const multer = require("multer");
const AppError = require("../utils/AppError");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      newObj[el] = obj[el];
    }
  });
  return newObj;
};

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an Image, Please only upload an image", 400), false);
  }
};
const upload = multer({
  storage,
  fileFilter,
});
exports.uploadUserPhoto = upload.single("photo");

exports.resizeAndUploadUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  const uploadStream = (req) =>
    new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          // this will resize the image to 500x500 and crop it to a square
          eager: [
            {
              width: 500,
              height: 500,
              crop: "fill",
              gravity: "auto",
              fetch_format: "auto",
              quality: "auto",
            },
          ],
          // You can tell Cloudinary to generate eager transformations in the background by setting the eager_async parameter to true
          // eager_async: true,

          // this specifies the folder under which the image is stored in cloudinary
          folder: "socioUsers",
          // the public_id is used to specify the file name
          public_id: req.user.id,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      streamifier.createReadStream(req.file.buffer).pipe(stream);
    });
  const result = await uploadStream(req);
  req.body.photo = result.eager[0].secure_url;
  console.log(req.body.photo);
  next();
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const features = ApiFeatures(User.find(), req.query)
    .filter()
    .sort()
    .paginate()
    .limitFields();
  const users = await features.query;
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});
exports.getOneUser = catchAsync(async (req, res, next) => {
  res.send("working");
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates, Please use /updatePassword",
        400
      )
    );
  }
  const user = await User.findByIdAndUpdate(
    req.user,
    filterObj(req.body, "name", "email", "photo"),
    {
      runValidators: true,
      new: true,
    }
  );
  if (!user) {
    return new AppError("Unable to update user", 400);
  }
  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return new AppError("Unable to delete user", 400);
  }
  res.status(204).json({
    status: "success",
    data: null,
  });
});
