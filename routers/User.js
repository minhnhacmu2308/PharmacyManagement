import express from "express";
const router = express.Router();
import {
  getAll,
  getEmployeeList,
  register,
  login,
  getCustomerList,
  lockAccount,
  updateProfile,
} from "../controllers/UserController.js";

router.get("/list", getAll);
router.get("/get-list-employee", getEmployeeList);
router.get("/get-list-customer", getCustomerList);
router.post("/lock-account", lockAccount);
router.post("/create-account", register);
router.post("/login", login);
router.post("/update-account", updateProfile);
export default router;
