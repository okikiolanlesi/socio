const mongoose = require("mongoose");
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category must have a name"],
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
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
