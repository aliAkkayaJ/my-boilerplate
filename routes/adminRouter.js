const express = require("express");

const Admin = require("../model/Admin");
const isAuthenticated = require("../middlewares/isAuthenticated");
const roleRestriction = require("../middlewares/roleRestriction");
const {
  registerAdmin,
  loginAdmin,
  getAllAdmins,
  getAdminProfile,
  updateAdminProfile,
  deleteAdmin,
} = require("../controller/adminController");
const adminRouter = express.Router();

adminRouter.post("/register", registerAdmin);
adminRouter.post("/login", loginAdmin);
adminRouter.get(
  "/",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  getAllAdmins
);
adminRouter.get(
  "/profile",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  getAdminProfile
);
adminRouter.put(
  "/update",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  updateAdminProfile
);
adminRouter.delete(
  "/delete",
  isAuthenticated(Admin),
  roleRestriction("admin"),
  deleteAdmin
);
module.exports = adminRouter;
