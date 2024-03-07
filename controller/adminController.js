const AsyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();
const Admin = require("../model/Admin");
const generateToken = require("../utils/generateToken");
const { hashPassword, isPasswordMatched } = require("../utils/helpers");
//@desc Register admin
//@route POST /api/admins/registee
//@access Private

exports.registerAdmin = AsyncHandler(async (req, res) => {
  const { name, telephone, email, password } = req.body;
  const adminFound = await Admin.findOne({ email });
  if (adminFound) {
    res.status(400);
    throw new Error("Admin already exists");
  }

  //register admin
  const admin = await Admin.create({
    name,
    telephone,
    email,
    password: await hashPassword(password),
  });
  res.status(201).json({
    status: "success",
    message: "Admin created successfully",
    data: admin,
  });
});

exports.loginAdmin = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await Admin.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("Admin Not Found");
  }
  //verify password
  const isMatch = await isPasswordMatched(password, user.password);

  if (!isMatch) {
    return res.json({ message: "Passwords don't match!" });
  } else {
    const accessToken = generateToken(
      user._id,
      process.env.JWT_ACCESS_EXPIRATION_HOURS
    ); // Access token expires in 1 hour
    const refreshToken = generateToken(
      user._id,
      process.env.JWT_REFRESH_EXPIRATION_DAYS
    ); // Refresh token expires in 7 days
    return res.json({
      success: true,
      message: "Passwords match!",
      accessToken,
      refreshToken,
      user,
    });
  }
});

//with .popule method u can see the what is the created details. I mean u don't see only id's.
exports.getAdminProfile = AsyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id).select(
    "-password -createdAt -updatedAt -__v"
  );
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  } else {
    res.status(200).json({
      status: "success",
      data: admin,
      message: "Admin profile fetched successfully",
    });
  }
});

exports.updateAdminProfile = AsyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user._id);
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }
  admin.name = req.body.name || admin.name;
  admin.telephone = req.body.telephone || admin.telephone;
  admin.email = req.body.email || admin.email;
  if (req.body.password) {
    admin.password = await hashPassword(req.body.password);
  }
  const updatedAdmin = await admin.save();
  res.status(200).json({
    status: "success",
    data: updatedAdmin,
    message: "Admin profile updated successfully",
  });
});

exports.getAllAdmins = AsyncHandler(async (req, res) => {
  const admins = await Admin.find().select("-createdAt -updatedAt -__v");
  res.status(200).json({
    status: "success",
    data: admins,
    message: "Admins fetched successfully",
  });
});

//@route DELETE /api/admins/:id

exports.deleteAdmin = AsyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user._id);
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }
  await admin.remove();
  res.status(200).json({
    status: "success",
    message: "Admin deleted successfully",
  });
});
