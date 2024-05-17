const AsyncHandler = require("express-async-handler");
const dotenv = require("dotenv");
dotenv.config();
const { generateToken } = require("../utils/generateToken.js");
const { hashPassword, isPasswordMatched } = require("../utils/helpers.js");
const User = require("../model/User.js");
const { sendResetPasswordEmail } = require("../services/emailService.js");
const verifyToken = require("../utils/verifyToken.js");

// @route POST /auth/register
exports.register = AsyncHandler(async (req, res) => {
  const { username, email, password, languages } = req.body;

  const existingUserUsername = await User.findOne({ username });
  const existingUserEmail = await User.findOne({ email });

  if (existingUserUsername && existingUserEmail) {
    res.status(400);
    throw new Error("Username and Email already exists");
  } else if (existingUserUsername) {
    res.status(400);
    throw new Error("Username already exists");
  } else if (existingUserEmail) {
    res.status(400);
    throw new Error("User with this mail already exists");
  }

  // Register
  const newUser = await User.create({
    username,
    email,
    password: await hashPassword(password),
    languages,
  });
  res.status(201).json({
    success: true,
    message: "User created successfully",
    data: newUser,
  });
});

exports.login = AsyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.json({ success: false, message: "User not found!" });
  }

  // Verify password
  const isMatch = await isPasswordMatched(password, user.password);

  if (!isMatch) {
    return res.json({ success: false, message: "Passwords don't match!" });
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

exports.forgotPassword = AsyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  const resetPasswordToken = generateToken(
    user._id,
    process.env.JWT_FORGOT_PASSWORD_EXPIRATION_MINUTES
  );

  await user.updateOne({ passwordToken: resetPasswordToken });

  // Send email
  await sendResetPasswordEmail(email, resetPasswordToken);

  user.save();
  res.status(200).json({
    success: true,
    message: "Email sent successfully",
    resetPasswordToken,
  });
});

exports.resetPassword = AsyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const { token } = req.query;
  // Token doğrulama
  const decodedToken = await verifyToken(token);
  if (!decodedToken.id) {
    res.status(400).json({ success: false, message: "Invalid token" });
    return;
  }

  // Kullanıcıyı bul ve token ile eşleştir
  const user = await User.findOne({ passwordToken: token });
  if (!user) {
    res.status(404).json({ success: false, message: "User not found" });
    return;
  }

  // Parolayı güncelle
  user.password = await hashPassword(newPassword);
  user.passwordToken = null; // Token'ı temizle
  await user.save();

  res.status(200).json({ success: true, message: "Password reset successful" });
});
