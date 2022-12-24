const mongoose = require("mongoose");

const save = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "Save must belong to a user"],
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Save = mongoose.model("Save", save);

module.exports = Save;
