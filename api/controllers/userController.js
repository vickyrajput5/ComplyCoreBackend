const UserService = require("../services/userService");
const UserValidation = require("../validation/userValidate");
const asyncHandler = require("express-async-handler");
const db = require("../models/");
const User = db.User;
const express = require("express");
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer);
class UserController {
  static userRegistration = asyncHandler(async (req, res) => {
    console.log("12345")
    // const requiredParams = await UserValidation.validateFields(req, res);

    const uniqueEmail = await UserValidation.validateAndCheckUniqueEmail(
      req,
      res
    );
    // const uniqueName = await UserValidation.uniqueUserName(req, res);
    // const passwordLength = await UserValidation.validatePassword(req, res);

    // const passwordConfirm = await UserValidation.passwordConfirm(req, res);
    // // const fileValidation = await UserValidation.validateFiles(req, res);
    // const profilePhoto = await UserValidation.profilePhoto(req, res);
   
    // if (requiredParams != true) {
    //   res.status(400).send(requiredParams);
    // } else if (uniqueName != true) {
    //   res.status(400).send(uniqueName);
    // } else 
    if (uniqueEmail != true) {
      res.status(400).send(uniqueEmail);
    }
    // } else if (passwordLength != true) {
    //   res.status(400).send(passwordLength);
    // } else if (passwordConfirm != true) {
    //   res.status(400).send(passwordConfirm);
    // } else if (profilePhoto != true) {
    //   res.status(400).send(profilePhoto);
    // } 
    else {
    //   try {
      const saved_user = await UserService.userCreate(req, res);
      // } catch (error) {
      //   res.status(500).send({
      //     status: "failed",
      //     message: "Unable to Register" + error.message,
      //   });
      // }
    }
  });
  static verifyOTP = asyncHandler(async (req, res) => {
    try {
      const OTP = await UserService.verifyOTP(req, res);
    } catch (error) {
      res.status(500).send({
        status: "failed",
        message: error.message,
      });
    }
  });
  static userLogin = asyncHandler(async (req, res) => {
    const loginRequiredParams = await UserValidation.loginRequiredParams(
      req,
      res
    );
    if (loginRequiredParams != true) {
      res.status(400).send(loginRequiredParams);
    } else {
      try {
        const useLogined = await UserService.userLogin(req, res);
      } catch (error) {
        res.status(500).send({ status: "failed", message: error.message });
      }
    }
  });
  static resetPassword = asyncHandler(async (req, res) => {
    try {
      const resetPassword = await UserService.resetPassword(req, res);
    } catch (error) {
      res.status(500).send({ status: "failed", message: error.message });
    }
  });
  static resetOTPVerify = asyncHandler(async (req, res) => {
    try {
      const resetPassword = await UserService.resetVerifyOtp(req, res);
    } catch (error) {
      res.status(500).send({ status: "failed", message: error.message });
    }
  });
  static updateNewPassword = asyncHandler(async (req, res) => {
    var updatePassRequiredParams =
      await UserValidation.updatePassRequiredParams(req, res);
    validatePassword;
    if (updatePassRequiredParams) {
      var validatePassword = await UserValidation.validatePassword(req, res);
    }
    if (validatePassword) {
      var passwordMatch = await UserValidation.passwordConfirm(req, res);
    }
    if (updatePassRequiredParams) {
      var passwordMatch = await UserValidation.passwordConfirm(req, res);
    }
    if (passwordMatch) {
      var sameOldPass = await UserValidation.sameOldPass(req, res);
    }

    if (updatePassRequiredParams != true) {
      res.status(400).send(updatePassRequiredParams);
    } else if (passwordMatch != true) {
      res.status(400).send(passwordMatch);
    } else if (sameOldPass != true) {
      res.status(400).send(sameOldPass);
    } else {
      try {
        const updatePassword = await UserService.updatePassword(req, res);
      } catch (error) {
        res.status(500).send({
          status: "failed",
          message: "Unable to update Password" + error.message,
        });
      }
    }
  });
  static resetPassword = asyncHandler(async (req, res) => {
    try {
      const resetPassword = await UserService.resetPassword(req, res);
    } catch (error) {
      res.status(500).send({ status: "failed", message: error.message });
    }
  });
  static getUserByEmail = asyncHandler(async (req, res) => {
    try {
      const UserByEmail = await UserService.getUserByEmail(req, res);
    } catch (error) {
      res.status(500).send({ status: "failed", message: error.message });
    }
  });
  static resendOTP = asyncHandler(async (req, res) => {
    try {
      const resendOTP = await UserService.resendOTP(req, res);
    } catch (error) {
      res.status(500).send({ status: "failed", message: error.message });
    }
  });
  static getcompanyDetail = asyncHandler(async (req, res) => {
    try {
      const getCompanyDetail = await UserService.getCompanyDetail(req, res);
    } catch (error) {
      res.status(500).send({ status: "failed", message: error.message });
    }
  });
}

module.exports = UserController;
