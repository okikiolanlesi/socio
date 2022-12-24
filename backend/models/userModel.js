const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "User must have a name"],
    },
    email: {
      type: String,
      required: [true, "User must have an email"],
      unique: true,
      lowercase: true,
      validate: {
        message: "User email must be a valid email address",
        validator: validator.isEmail,
      },
    },
    password: {
      type: String,
      required: [true, "User must have a password"],
      select: false,
    },
    photo: {
      type: String,
    },
    passwordConfirm: {
      type: String,
      required: [true, "User must confirm password"],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same",
      },
    },
    emailConfirmed: {
      type: Boolean,
      default: false,
      required: [true, " User email confirmation status must be available"],
    },
    confirmEmailExpires: Date,
    passwordChangedAt: Date,
    passwordResetExpires: Date,
    passwordResetToken: String,
    emailConfirmationToken: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  }
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
userSchema.methods.changedPasswordAfter = async function (JWTTIMESTAMP) {
  if (this.passwordChangedAt) {
    const changedTimeStamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return changedTimeStamp > JWTTIMESTAMP;
  }
  return false;
};

userSchema.methods.createPasswordResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.methods.createEmailConfirmationToken = async function () {
  const confirmToken = crypto.randomBytes(32).toString("hex");
  this.emailConfirmationToken = crypto
    .createHash("sha256")
    .update(confirmToken)
    .digest("hex");
  this.confirmEmailExpires = Date.now() + 10 * 60 * 1000;
  return confirmToken;
};
const User = mongoose.model("User", userSchema);

module.exports = User;
