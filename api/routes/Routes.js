const express = require("express");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "api/public/");
  },

  filename: function (req, file, cb) {
    const d = new Date();
    let hour = d.getUTCHours().toString();
    let minutes = d.getUTCMinutes().toString();
    let date = d.getUTCDate().toString();
    let year = d.getUTCFullYear().toString();
    const uniqueSuffix = hour + minutes + date + year + "-" + file.originalname;
    cb(null, uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

const app = express();
module.exports = (app) => {
  const UserController = require("../controllers/userController");
 
  var router = require("express").Router();
  router.post(
    "/register",
    upload.fields([
      { name: "profilePhoto", maxCount: 1 },
      { name: "uploadFiles", maxCount: 3 },
      { name: "uploadPortfolio", maxCount: 3 },
    ]),
    UserController.userRegistration
  );
  router.post("/verifyotp", UserController.verifyOTP);
  router.post("/login", UserController.userLogin);
  router.post("/resetpassword", UserController.resetPassword);
  router.post("/resetotp", UserController.resetOTPVerify);
  router.put("/updatepassword", UserController.updateNewPassword);
  
  app.use("/api/users", router);
};
