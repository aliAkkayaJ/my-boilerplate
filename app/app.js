const express = require("express");
const adminRouter = require("../routes/adminRouter");
const {
  notFoundErr,
  globalErrHandler,
} = require("../middlewares/globalErrHandler");

//app
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/v1/admins", adminRouter);

// Error Handler
app.use(notFoundErr);
app.use(globalErrHandler);

module.exports = app;
