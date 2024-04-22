// imports
const express = require("express");
const path = require("path");
const body_parser = require("body-parser");
const articel_router = require("./router/article.router");
const auth_router = require("./router/account.router");

//multer configs
const multer = require("multer");
const multerStore = multer.diskStorage({
  destination: (req, file, cb) => {
    // Specify the destination folder where uploaded files will be stored
    cb(null, "uploads/images");
  },
  filename: (req, file, cb) => {
    // Extract the file extension from the original filename
    const fileExtension = file.originalname.split(".").pop();
    // Generate a unique prefix for the filename
    const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Construct the unique filename by combining the prefix and original filename
    const uniqueFilename = uniquePrefix + "-" + file.originalname;
    // Pass the unique filename to the callback function
    cb(null, uniqueFilename);
  },
});
const imageFilter = (req, file, cb) => {
  // Check if the file mimetype starts with 'image/'
  if (file.mimetype.startsWith("image/")) {
    // Accept the file, pass true to the callback
    cb(null, true);
  } else {
    // Reject the file, pass false to the callback with an error message
    cb(new Error("Only image files are allowed"));
  }
};

//general configs
const app = express();
const PORT = 3000;
const db = require("./db");
app.use(body_parser.json());
app.use(
  multer({
    storage: multerStore,
    fileFilter: imageFilter,
  }).single("file")
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//router routes
app.use(articel_router);
app.use(auth_router);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
