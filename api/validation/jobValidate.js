const db = require("../models/");
const User = db.User;
const bcrypt = require("bcrypt");
const path = require("path");
class UserValidate {
  static validateFields = async (req, res) => {
    const { title, description, categoryId, address, skills, UserId } =
      req.body;
    if (title && description && categoryId && address && skills && UserId) {
      return true;
    } else {
      return {
        status: "failed",
        message: "All fields are required",
      };
    }
  };
  static companyValidateFields = async (req, res) => {
    const {
      title,
      description,
      categoryId,
      address,
      skills,
      startdate,
      enddate,
      UserId,
      amount,
    } = req.body;
    if (
      title &&
      description &&
      categoryId &&
      address &&
      skills &&
      startdate &&
      enddate &&
      UserId &&
      amount
    ) {
      return true;
    } else {
      return {
        status: "failed",
        message: "All fields are required",
      };
    }
  };
  static mileStonevalidateFields = async (req, res) => {
    try {
      const { jobId, mileStoneName, description, UserId, amount, dueDate } =
        req.body;
      if (
        mileStoneName &&
        description &&
        UserId &&
        amount &&
        dueDate &&
        jobId
      ) {
        return true;
      } else {
        return {
          status: "failed",
          message: "All fields are required",
        };
      }
    } catch (error) {
      res.send(error.message);
    }
  };
}

module.exports = UserValidate;
