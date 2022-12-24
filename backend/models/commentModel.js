const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
      required: [true, "comments must belong to a user"],
    },
    post: {
      type: mongoose.Schema.ObjectId,
      ref: "Post",
    },
    comment: {
      type: String,
      required: [true, "Comment must have a comment"],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Comment = mongoose.model("comment", commentSchema);

module.exports = Comment;
