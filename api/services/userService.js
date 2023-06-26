const db = require("../models/");
const otpGenerator = require("otp-generator");
const transporter = require("../config/emailConfig");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const hbs = require("nodemailer-express-handlebars");
const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");

const User = db.User;
const UserOTPverification = db.UserOTPverification;
const path = require("path");
class UserService {
  static userCreate = asyncHandler(async (req, res) => {
    //try {
      const {
        name,
        email,
        password,
        confirmPassword,
        phone,
      } = req.body;
      const salt = await bcrypt.genSalt(10);
      const hashPassword = await bcrypt.hash(password, salt);
      const confirmPasswords = await bcrypt.hash(confirmPassword, salt);
      
      const user = await User.create({
        name: name,
        email: email,
        password: hashPassword,
        phone: phone,
      });
      console.log('1345')
      await user.save();
      res.status(201).send({
        status: "success",
        message: "User Created Successfully.",
        userId: user.id,
      });
  });
  static mailVerification = asyncHandler(async ({ id, email }, res) => {
    try {
      //const { email } = req.body;
      console.log("123");
      const otp = otpGenerator.generate(6, {
        digits: true,
        alphabets: false,
        upperCase: false,
        specialChars: false,
        expiresIn: 60,
      });

      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const handlebarOptions = {
        viewEngine: {
          extName: ".handlebars",
          partialsDir: path.resolve("./views"),
          defaultLayout: false,
        },
        viewPath: path.resolve("./views"),
        extName: ".handlebars",
      };
      transporter.use("compile", hbs(handlebarOptions));
      const mailOptions = {
        from: "reno@gmail.com",
        to: email,
        subject: `${otp} is your Reno verification code`,

        template: "verify",
        context: {
          otp: otp,
        },
      };
      const saltRounds = 10;
      const hashedOTP = await bcrypt.hash(otp, saltRounds);
      const newOTPVerification = await new UserOTPverification({
        otp: hashedOTP,
        userId: id,
        createdAt: Date.now(),
        expiresAt: Date.now() + 60000,
      });
      await newOTPVerification.save();
      await transporter.sendMail(mailOptions);
      return {
        status: "Pending",
        message: "verification otp mail sent",
        userId: id,
        data: { email },
      };
    } catch (error) {
      res.status(500).send({
        status: "failed",
        message: "verification failed" + error.message,
      });
    }
  });
  static otpFunction = asyncHandler(async ({ userId, otp }, res) => {
    try {
      const otpVerification = await UserOTPverification.findOne({
        where: { userId: userId },
      });

      if (!otpVerification || otpVerification.otp.length < 6) {
        throw new Error("OTP doesn't exist or has been verified already");
      } else {
        const { expiresAt } = otpVerification;
        const hashedOTP = otpVerification.otp;
        if (expiresAt < Date.now()) {
          await UserOTPverification.destroy({
            where: { userId: userId },
          });

          throw new Error("Code has expired. Please Request Again");
        } else {
          const validOPT = await bcrypt.compare(otp, hashedOTP);
          if (!validOPT) {
            throw new Error("Invalid OTP");
          } else {
            await User.update(
              {
                is_verified: true,
              },
              {
                where: {
                  id: userId,
                },
              }
            );
            await UserOTPverification.destroy({
              where: {
                userId: userId,
              },
            });
          }
          res.status(200).send({
            status: "success",
            message: "OTP Verified",
          });
        }
      }
    } catch (error) {
      res.status(500).send({
        status: "failed",
        message: "Invalid OTP",
      });
    }
  });
  static verifyOTP = asyncHandler(async (req, res) => {
    try {
      const { userId, otp } = req.body;
      if (!otp) {
        res
          .status(400)
          .send({ status: "Failed", message: "OTP field is required" });
      } else {
        await this.otpFunction({ userId, otp }, res);
      }
    } catch (error) {
      res.status(500).send({
        status: "failed",
        message: "verification failed: " + error.message,
      });
    }
  });
  static userLogin = asyncHandler(async (req, res) => {
    try {
      const { email, password, type } = req.body;

      const user = await User.findOne({
        where: { email: email },
      });
      const userVerified = await User.findOne({
        where: { email: email, is_verified: true },
      });
      if (user != null) {
        // if (user.role == type) {
        if (userVerified) {
          const isMatch = await bcrypt.compare(password, user.password);
          if (user.email === email && isMatch) {
            // Generate JWT Token
            const token = jwt.sign(
              { userID: user.id },
              process.env.JWT_SECRET_KEY,
              { expiresIn: "5d" }
            );
            //  getSubscription.status = "expired";

            req.session.token = token;

            res.status(200).send({
              status: "success",
              message: "Login Successfull",
              token: token,
              result: user,
            });
          } else {
            res.status(400).send({
              status: "failed",
              message: "Password is not correct",
            });
          }
        } else {
          res.status(400).send({
            status: "failed",
            message: "User is not Verified",
          });
        }
      } else {
        res.status(400).send({
          status: "failed",
          message: "You are not a Registered User",
        });
      }
    } catch (error) {
      res.status(500).send({
        status: "failed",
        message: "Unable to login: " + error.message,
      });
    }
  });
  static resetPassword = asyncHandler(async (req, res) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ where: { email: email } });

      if (user) {
        var mailVerification = await this.mailVerification(
          { id: user.id, email: user.email },
          res
        );

        res.status(200).send({
          status: "success",
          message: "Email has been Sent.",
          User: user,
        });
      } else {
        throw Error("You are not a registered User");
      }
    } catch (error) {
      res.status(500).send({
        status: "failed",
        message: "Unable to reset Password: " + error.message,
      });
    }
  });
  static resetVerifyOtp = asyncHandler(async (req, res) => {
    try {
      const { userId, otp } = req.body;
      if (!otp) {
        res
          .status(400)
          .send({ status: "failed", message: "OTP field is required" });
      } else {
        const verifyOtp = await this.otpFunction({ userId, otp }, res);
        if (verifyOtp) {
          await UserOTPverification.destroy({
            where: { userId: userId },
          });
        }
      }
    } catch (error) {
      res.status(500).send({
        status: "failed",
        message: "Unable to reset Password: " + error.message,
      });
    }
  });
  static updatePassword = asyncHandler(async (req, res) => {
    try {
      const { userId, password, confirmPassword } = req.body;
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return {
          status: "failed",
          message: "User not found",
        };
      }

      const salt = await bcrypt.genSalt(10);
      const hashNewPassword = await bcrypt.hash(password, salt);

      if (password !== confirmPassword) {
        return {
          status: "failed",
          message: "Password and confirm password are not the same",
        };
      }

      if (hashNewPassword === user.password) {
        return {
          status: "failed",
          message: "New password cannot be the same as old password",
        };
      }

      await User.update(
        { password: hashNewPassword },
        { where: { id: userId } }
      );

      res.status(200).send({
        status: "success",
        message: "Password changed successfully",
      });
    } catch (err) {
      res.status(500).send({
        status: "failed",
        message: "Error updating password" + err.message,
      });
    }
  });
  static getUserByEmail = asyncHandler(async (req, res) => {
    try {
      const { email } = req.body;

      const Userr = await User.findOne({ where: { email: email } });
      if (!Userr) {
        throw Error("Email not found");
      } else {
        res.status(200).send({
          status: "success",
          response: Userr,
        });
      }
    } catch (error) {
      res.status(500).send({
        status: "failed",
        message: "Unable to reset Password: " + error.message,
      });
    }
  });
  static getUserById = asyncHandler(async (id) => {
    const Userr = await User.findByPk(id);
    if (!Userr) {
      return false;
    } else {
      return Userr;
    }
  });
  static resendOTP = asyncHandler(async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        res
          .status(400)
          .send({ status: "Failed", message: "User Id is required" });
      } else {
        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
          res.status(404).send({ status: "Failed", message: "User not found" });
        } else {
          const currentTime = new Date();

          const lastOTP = await UserOTPverification.findOne({
            where: { userId: userId },
            order: [["createdAt", "DESC"]],
          });
          const timeSinceLastRequest = lastOTP
            ? currentTime - lastOTP.createdAt
            : Infinity;

          if (timeSinceLastRequest < 60 * 1000) {
            res.status(429).send({
              status: "Failed",
              message: "Please wait one minute for a new OTP",
            });
          } else {
            await UserOTPverification.destroy({
              where: {
                userId: userId,
              },
            });

            await this.mailVerification({ id: userId, email: user.email }, res);

            res
              .status(200)
              .send({ status: "Success", message: "OTP has been resent." });
          }
        }
      }
    } catch (error) {
      res.status(500).send({
        status: "failed",
        message: "Unable to resend OTP: " + error.message,
      });
    }
  });

  static getCompanyDetail = async (req, res) => {
    const companyId = req.params.id;

    try {
      let company = await User.findOne({
        attributes: {
          exclude: [
            "password",
            "confirmPassword",
            "role",
            "isAdmin",
            "is_verified",
            "createdAt",
            "updatedAt",
            "id",
          ],
        },
        where: {
          id: companyId,
          role: "company",
        },
      });
      if (!company) {
        return res
          .status(404)
          .json({ status: "failed", message: "Company not found" });
      }
      company = company.toJSON();
      company = Object.fromEntries(
        Object.entries(company).filter(([_, v]) => v != null)
      );
      res.status(200).json(company);
    } catch (error) {
      console.error("Error retrieving company data:", error);
      res.status(500).json({ error: "Internal server error" + error });
    }
  };
}
module.exports = UserService;
