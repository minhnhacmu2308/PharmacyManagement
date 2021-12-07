import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    fullName: {
      type: String,
    },
    userName: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phonenumber: {
      type: String,
    },
    idCard: {
      type: String,
    },
    address: {
      type: String,
    },
    gender: {
      type: String,
      enum: ["male", "female", "undefined"],
      default: "undefined",
    },
    role: {
      type: String,
      enum: ["admin", "employee", "customer"],
      default: "undefined",
    },
    avatar: {
      type: String,
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);
schema.index({
  first_name: "text",
  last_name: "text",
  email: "text",
  fullName: "text",
  address: "text",
});
export const UserModel = mongoose.model("User", schema);
