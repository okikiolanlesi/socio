const express = require("express");
const postController = require("../controllers/postController");
const authController = require("../controllers/authController");
const router = express.Router();

router
  .route("/")
  .get(postController.getAllPosts)
  .post(
    authController.protect,
    postController.setUserId,
    postController.uploadPostImage,
    postController.resizeAndUploadPostImage,
    postController.createPost
  );

router.route("/:id").get(postController.getPost);

module.exports = router;
