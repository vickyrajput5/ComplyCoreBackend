const db = require("../models/");
const User = db.User;
const bcrypt = require("bcrypt");
const path = require("path");
const validator = require("validator");

class UserValidate {
  static validateFields = async (req, res) => {
    const {
    //  firstName,
      lastName,
      userName,
      dateOfBirth,
      gender,
      phoneNumber,
      email,
      password,
      companyName,
      description,
      speciality,
      location,
      accraNumber,
      role,
      confirmPassword,
      categoryId,
    } = req.body;
    if (role) {
      const { uploadFiles, uploadPortfolio } = req.files;
      if (role == "customer") {
        if (
        //  firstName &&
          lastName &&
          userName &&
          gender &&
          dateOfBirth &&
          phoneNumber &&
          email &&
          password &&
          confirmPassword
        ) {
          return true;
        } else {
          return {
            status: "failed",
            message: "All fields are required",
          };
        }
      } else if (role == "company") {
        if (
          companyName &&
          description &&
          speciality &&
          location &&
          phoneNumber &&
          email &&
          password &&
          confirmPassword &&
          accraNumber &&
          uploadFiles &&
          uploadPortfolio
        ) {
          return true;
        } else {
          return {
            status: "failed",
            message: "All fields are required",
          };
        }
      } else if (role == "contractor") {
        if (
          userName &&
          description &&
          speciality &&
          location &&
          phoneNumber &&
          email &&
          password &&
          confirmPassword &&
          uploadFiles &&
          uploadPortfolio
        ) {
          return true;
        } else {
          return {
            status: "failed",
            message: "All fields are required",
          };
        }
      } else if (role == "admin") {
        return true;
      }
    } else {
      return {
        status: "failed",
        message: "All fields are required",
      };
    }
  };
  static validatePassword = async (req, res) => {
    const { password } = req.body;
    const passwordLength = password && password.length;
    if (passwordLength >= 6) {
      return true;
    } else {
      return {
        status: "Failed",
        message: "Password must be minimum 6 characters",
      };
    }
  };
  // static uniqueEmail = async (req) => {
  //   const { email } = req.body;
  //   const user = await User.findOne({
  //     where: { email: email },
  //   });
  //   if (user) {
  //     return {
  //       status: "failed",
  //       message: "Email already exists",
  //     };
  //   } else {
  //     return true;
  //   }
  // };
  static validateAndCheckUniqueEmail = async (req, res) => {
    const { email } = req.body;
    if (!validator.isEmail(email)) {
      return {
        status: "Failed",
        message: "Invalid email format",
      };
    }
    const user = await User.findOne({
      where: {
        email: email,
      },
    });

    if (user) {
      return {
        status: "Failed",
        message: "Email already exists",
      };
    } else {
      return true;
    }
  };

  static uniqueUserName = async (req, res) => {
    if (req.body.role == "company") {
      return true;
    } else {
      const { userName } = req.body;
      if (userName) {
        const uName = await User.findOne({
          where: { userName: userName },
        });
        if (uName) {
          return {
            status: "Failed",
            message: "username already exists",
          };
        } else {
          return true;
        }
      }
    }
  };
  static passwordConfirm = async (req, res) => {
    const { password, confirmPassword } = req.body;
    if (password == confirmPassword) {
      return true;
    } else {
      return {
        status: "Failed",
        message: "Password does not match",
      };
    }
  };
  static userFullnameValidate = async (req, res) => {
    const { fullName } = req.body;
    function isValidFullName(fullName) {
      const regex = /^[a-zA-Z\s]*$/; // regular expression to match only letters and spaces
      return regex.test(fullName);
    }
    const isValid = isValidFullName(fullName);
    if (isValid == true) {
      return true;
    } else {
      return {
        status: "Failed",
        message: "Full Name Should Only Contain Alphabets",
      };
    }
  };
  static loginRequiredParams = async (req, res) => {
    const { email, password } = req.body;

    if (email && password) {
      return true;
    } else {
      return { status: "Failed", message: "All fields are required" };
    }
  };
  static updatePassRequiredParams = async (req, res) => {
    const { password, confirmPassword } = req.body;
    if (password && confirmPassword) {
      return true;
    } else {
      return { status: "Failed", message: "All fields are required" };
    }
  };
  static sameOldPass = async (req, res) => {
    const { userId, password } = req.body;

    let user = await User.findOne({ where: { id: userId } });

    if (!user) {
      return { status: "Failed", message: "User not found" };
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return true;
    } else {
      return {
        status: "Failed",
        message:
          "Password same as current password, Please enter a new password ",
      };
    }
  };
  static profilePhoto = async (req) => {
    const { profilePhoto } = req.files;

    if (!profilePhoto) {
      return true;
    }

    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    const fileExtension = path.extname(profilePhoto[0].originalname);
    const fileSize = profilePhoto[0].size / 1024 / 1024;

    if (!allowedExtensions.includes(fileExtension.toLowerCase())) {
      return {
        status: "failed",
        message: "Profile picture must be a JPEG or PNG image",
      };
    }

    if (fileSize > 12) {
      return {
        status: "failed",
        message:
          "Profile picture file size should be less than or equal to 12 MB",
      };
    }

    return true;
  };
}

module.exports = UserValidate;
