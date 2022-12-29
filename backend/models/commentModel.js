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
      required: [true, "comments must belong to a post"],
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

commentSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name photo" });
});

const Comment = mongoose.model("comment", commentSchema);

module.exports = Comment;
