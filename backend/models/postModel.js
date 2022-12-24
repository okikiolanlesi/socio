const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Post must have a title"],
    },
    about: {
      type: String,
      required: [true, "Post must have a description"],
    },
    image: {
      type: String,
      required: [true, "Post must have an image"],
    },
    destination: {
      type: String,
      required: [true, "Post must have a destination"],
    },
    category: {
      type: String,
      required: [true, "Post must have a category"],
      enum: {
        values: [
          "Adventure",
          "Culture",
          "Food",
          "Nature",
          "Relaxation",
          "Shopping",
          "Sightseeing",
          "Sports",
          "Wildlife",
        ],
        message:
          "Category is either: Adventure, Culture, Food, Nature, Relaxation, Shopping, Sightseeing, Sports, Wildlife",
      },
      default: "Adventure",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
postSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  });
  next();
});

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
