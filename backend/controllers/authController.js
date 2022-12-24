const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const crypto = require("crypto");
const AppError = require("../utils/AppError");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const Email = require("../utils/email");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    maxAge: process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    // httpOnly: true means that the cookie cannot be accessed or modified in any way by the browser
    httpOnly: true,
    secure: true,
    sameSite: "none",
  };

  res.cookie("jwt", token, cookieOptions);

  // Remove password from output
  user.password = undefined;
  user.passwordChangedAt = undefined;
  user.passwordResetToken = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    // role: req.body.role,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    // passwordChangedAt: req.body.passwordChangedAt,
  });
  // implement confirm email functionalities
  const confirmationToken = await newUser.createEmailConfirmationToken();
  await newUser.save({ validateBeforeSave: false });

  // Send Confirm Email email
  console.log(confirmationToken);
  try {
    const url = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/confirmEmail/${confirmationToken}`;

    await new Email(newUser, url).sendConfirmEmail();

    createSendToken(newUser, 201, req, res);
  } catch (err) {
    await User.deleteOne({ _id: newUser._id });
    return next(
      new AppError("Unable to sign up user, please try again later", 500)
    );
  }
});
exports.confirmEmail = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({ emailConfirmationToken: hashedToken });

  if (!user) return next(new AppError("Token is invalid or has expired", 400));
  if (user.emailConfirmed)
    return next(new AppError("Email is already confirmed", 400));
  if (user.confirmEmailExpires < Date.now()) {
    User.findByIdAndDelete(user._id);
    return next(
      new AppError("Token is invalid or has expired, please sign up again", 400)
    );
  }

  const updateData = {
    emailConfirmed: true,
    $unset: {
      emailConfirmationToken: 1,
      confirmEmailExpires: 1,
    },
  };

  await User.findByIdAndUpdate(user._id, updateData, {
    new: true,
    runValidators: true,
  });

  // Replace with frontend profile link
  const url = `${req.protocol}://${req.get("host")}/me`;

  await new Email(user, url).sendWelcome();

  res.status(200).json({
    status: "success",
    message: "Email confirmed successfully",
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if req.body contains email and password
  if (!email || !password) {
    return next(new AppError("email and password must be provided", 400));
  }

  /* Check if user exists and password is correct...
  Remember to explicitly select the password because we added an option in the user model which makes it not show up in find queries*/
  const user = await User.findOne({ email: email }).select("+password");
  // By not handling errors separately, it makes the error message more vague for attackers

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // If everything is okay send token to client
  createSendToken(user, 200, req, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // Get token and check if its there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access", 401)
    );
  }
  // Verification of token
  const decodedData = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );
  // Check if user exists
  const user = await User.findById(decodedData.id);
  if (!user) return next(new AppError("User no longer exists", 401));
  // Check if user changed password after token was issued
  if (!user.changedPasswordAfter(decodedData.iat)) {
    return next(
      new AppError("Recently changed password! Please login again", 401)
    );
  }
  // Check if user as confirmed his/her email
  if (!user.emailConfirmed) {
    return next(
      new AppError(
        "Your email is not confirmed, please confirm email before your token expires",
        401
      )
    );
  }
  req.user = user;
  res.locals.user = user;

  next();
});
// Only for rendered pages(templates), no errors
exports.isLoggedIn = async (req, res, next) => {
  // Get token and check if its there
  if (req.cookies.jwt) {
    try {
      // Verification of token
      const decodedData = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
      if (!decodedData) return next();

      // Check if user exists
      const user = await User.findById(decodedData.id);
      if (!user) return next();
      // Check if user changed password after token was issued
      if (!user.changedPasswordAfter(decodedData.iat)) {
        return next();
      }

      // There is a logged in user
      res.locals.user = user;

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    // roles is an array
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action")
      );
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1) Get user with the provided email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("Their is no user with that email address", 404));
  }

  // 2)Generate random token
  const resetToken = await user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // 3)Send token to user email
  try {
    // Formats the reset url so that it works in development and production
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/users/resetpassword/${resetToken}`;

    // const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;
    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token (valid for 10 minutes)',
    //   message: message,
    // });

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({ status: "success", message: "Token sent to email" });
  } catch (err) {
    // incase the email fails to send, we want to reset the password reset token and password reset expires fields
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1) Get user based on the token
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  // 2) If token has not expired, and there is a user, set the new password
  if (!user) {
    return next(new AppError("Token has expired. Please try again", 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  // 3) Update changedPasswordAt property for the user
  //  We did this in the userModel by setting up a pre save middleware/hook
  await user.save();
  // 4) Log the user in, send JWT
  createSendToken(user, 200, req, res);
});
exports.updatePassword = catchAsync(async (req, res, next) => {
  if (
    !req.body.password ||
    !req.body.passwordConfirm ||
    !req.body.currentPassword
  ) {
    return next(new AppError("Please provide a password and password confirm"));
  }
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError("Incorrect password", 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.save();
  createSendToken(user, 200, req, res);
});
exports.logout = catchAsync((req, res, next) => {
  res.cookie("jwt", "loggedout", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      message: "User logged out successfully",
    },
  });
});
