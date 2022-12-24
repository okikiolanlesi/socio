const catchAsync = require("../utils/catchAsync");
const User = require("../models/userModel");
const ApiFeatures = require("../utils/ApiFeatures");

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
