const mongoose = require("mongoose");

const saveSchema = new mongoose.Schema(
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

saveSchema.pre(/^find/, function (next) {
  this.populate({ path: "user", select: "name photo" }).populate({
    path: "post",
    select: "title about image destination category",
  });
  next();
});

const Save = mongoose.model("Save", saveSchema);

module.exports = Save;
