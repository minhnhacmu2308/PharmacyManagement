import { UserModel } from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import niv from "node-input-validator";
import CryptoJS from "crypto-js";
("use strict");
import nodemailer from "nodemailer";
import cloudinary from "cloudinary";
cloudinary.config({
  cloud_name: "ilike",
  api_key: "678772438397898",
  api_secret: "zvdEWEfrF38a2dLOtVp-3BulMno",
});

function encrypt(text) {
  return CryptoJS.HmacSHA256(text, process.env.encrypt_secret_key).toString(
    CryptoJS.enc.Hex
  );
}

const uploadImg = async (path) => {
  let res;
  try {
    res = await cloudinary.uploader.upload(path);
  } catch (err) {
    console.log(err);
    return false;
  }
  return res.secure_url;
};

export const getAll = async (req, res) => {
  try {
    const listUser = await UserModel.find();
    res.status(200).json(listUser);
  } catch (e) {
    console.log(e);
  }
};

//get list employee
export const getEmployeeList = async (req, res) => {
  try {
    const listEmployee = await UserModel.find({ role: "employee" }, {});
    res.status(200).json({
      status: true,
      data: listEmployee,
    });
  } catch (e) {
    console.log(e);
  }
};

//get list employee
export const getCustomerList = async (req, res) => {
  try {
    const listCustomer = await UserModel.find({ role: "customer" }, {});
    res.status(200).json({
      status: true,
      data: listCustomer,
    });
  } catch (e) {
    console.log(e);
  }
};

// create account
export const register = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      password: "required|minLength:8",
      email: "required|email",
      role: "required",
      userName: "required|minLength:6",
      phonenumber: "required|phoneNumber",
      address: "required",
      idCard: "required|minLength:12",
      gender: "required",
    });
    const matched = await v.check();
    if (matched) {
      if (
        (await isEmailExist(req.body.email)) == false &&
        (await isUserNameExist(req.body.userName)) == false
      ) {
        const password_hash = encrypt(req.body.password);
        const user = new UserModel({
          password: password_hash,
          email: req.body.email,
          userName: req.body.userName,
          role: req.body.role,
          phonenumber: req.body.phonenumber,
          address: req.body.address,
          idCard: req.body.idCard,
          gender: req.body.gender,
          status: 1,
        });
        await user.save(function (err) {
          if (err) {
            res.status(500).json({ errors: err });
          } else {
            res.status(200).json({ success: true, data: user });
          }
        });
      } else {
        res.status(200).json({
          success: false,
          messages: "Email or userName is existed !!!",
        });
      }
    } else {
      res.status(200).json({ errors: v.errors });
    }
  } catch (err) {
    res.status(500).json({ errors: err });
  }
};

//ckeck email exist
async function isEmailExist(email) {
  try {
    const result = await UserModel.findOne({ email: email });
    let kq = false;
    if (result != null) {
      kq = true;
    }
    return kq;
  } catch (err) {
    throw err;
  }
}

//ckeck userName exist
async function isUserNameExist(userName) {
  try {
    const result = await UserModel.findOne({ userName: userName });
    let kq = false;
    if (result != null) {
      kq = true;
    }
    return kq;
  } catch (err) {
    throw err;
  }
}

//checkLogin
async function checkLogin(userName, password) {
  const passwordUser = await UserModel.findOne(
    { userName: userName, role: "admin" },
    { password: 1, _id: 0 }
  );
  const statusUser = await UserModel.findOne(
    { userName: userName },
    { status: 1, _id: 0 }
  );
  console.log(statusUser);
  if (passwordUser != null) {
    if (passwordUser.password == password) {
      if (statusUser.status == 1) {
        return "success";
      } else {
        return { message: "Account unactive" };
      }
    } else {
      return { message: "Password incorrect" };
    }
  } else if (passwordUser == null) {
    return { message: " Username not existed!!" };
  }
}

//get-userId
async function getUserID(loginquery) {
  try {
    var id = await UserModel.findOne(
      {
        userName: loginquery,
      },
      "_id"
    );
    return id._id;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

//user-login
export const login = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      password: "required|minLength:8",
      userName: "required",
    });
    const matched = await v.check();
    if (matched) {
      const password_hash = encrypt(req.body.password);
      const result = await checkLogin(req.body.userName, password_hash);
      if (result == "success") {
        const ID = await getUserID(req.body.userName);
        const information = await UserModel.findOne({ _id: ID });
        const tokenInformation = {
          _id: ID,
          email: information.email,
          userName: information.userName,
          phoneNumber: information.phoneNumber,
          role: information.role,
          avatar: information.avatar,
        };
        jwt.sign(
          tokenInformation,
          process.env.login_secret_key,
          (err, token) => {
            if (err) {
              console.log(err);
            }
            const loginresult = {
              success: true,
              secret_key: token,
            };
            res.status(200).json({ success: true, data: loginresult });
          }
        );
      } else {
        res.status(200).json({ success: false, errors: result });
      }
    } else {
      res.status(200).json({ success: false, errors: v.errors });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
};

//khóa tài khoản
export const lockAccount = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
      idAccount: "required",
    });
    const matched = await v.check();
    if (matched) {
      jwt.verify(
        req.body.secret_key,
        process.env.login_secret_key,
        async (err, decoded) => {
          if (err) {
            res.status(500).json({ error: err });
          }
          if (decoded) {
            console.log(decoded);
            if (decoded.role == "admin") {
              let result = null;
              result = await UserModel.findOneAndUpdate(
                { _id: req.body.idAccount },
                { status: 0 },
                { new: true }
              );
              if (result != null) {
                res.status(200).json({ status: true, data: result });
              } else {
                res.status(200).json({ error: "Lock failed" });
              }
            } else {
              res.status(200).json({ error: "Role Invalid" });
            }
          }
        }
      );
    } else {
      res.status(200).json({ error: v.errors });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

//update profile
export const updateProfile = async (req, res) => {
  try {
    const v = new niv.Validator(req.body, {
      secret_key: "required",
      idAccount: "required",
    });
    const matched = await v.check();
    if (matched) {
      jwt.verify(
        req.body.secret_key,
        process.env.login_secret_key,
        async (err, decoded) => {
          if (err) {
            res.status(500).json({ error: err });
          }
          if (decoded) {
            let result = await editPersonalInformation(
              req.body.idAccount,
              req.body.fullName,
              req.body.phoneNumber,
              req.body.gender,
              req.body.address,
              req.body.idCard
            );
            console.log(result);
            if (result.status == true) {
              res.status(200).json(result);
            } else {
              res.status(200).json(result);
            }
          }
        }
      );
    } else {
      res.status(200).json({ error: v.errors });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

// Edit personal information
async function editPersonalInformation(
  _id,
  fullName,
  phoneNumber,
  gender,
  address,
  idCard
) {
  try {
    let userDocs = {
      fullName: fullName,
      phonenumber: phoneNumber,
      gender: gender,
      address: address,
      idCard: idCard,
    };
    // console.log(userDocs);
    let result = await UserModel.updateOne({ _id: _id }, userDocs);
    if (result) {
      return { status: true, data: userDocs };
    } else {
      return { status: false, errors: "update failed" };
    }
  } catch (e) {
    return e;
  }
}
