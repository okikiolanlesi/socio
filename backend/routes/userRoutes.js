const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router.get("/confirmEmail/:token", authController.confirmEmail);

router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);
router.get("/logout", authController.logout);
router.patch("/updatePassword", authController.updatePassword);
router.patch(
  "/updateMe",
  authController.protect,
  userController.uploadUserPhoto,
  userController.resizeAndUploadUserPhoto,
  userController.updateMe
);
router.route("/").get(userController.getAllUsers);

router
  .route("/:id")
  .get(userController.getOneUser)

  .delete(userController.deleteUser);

module.exports = router;
