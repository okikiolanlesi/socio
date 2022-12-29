const Post = require("../models/postModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const ApiFeatures = require("../utils/ApiFeatures");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

exports.setUserId = (req, res, next) => {
  req.body.user = req.user.id;
  next();
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
exports.uploadPostImage = upload.single("image");

exports.resizeAndUploadPostImage = catchAsync(async (req, res, next) => {
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
  req.body.image = result.eager[0].secure_url;
  next();
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const features = new ApiFeatures(Post.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();
  const posts = await features.query;
  res.status(200).json({
    status: "success",
    results: posts.length,
    data: {
      posts,
    },
  });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return next(new AppError("No post found with that ID", 404));
  }
  res.status(200).json({
    status: "success",
    data: {
      post,
    },
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  const newPost = await Post.create(req.body);
  res.status(201).json({
    status: "success",
    data: {
      post: newPost,
    },
  });
});
