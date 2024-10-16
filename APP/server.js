const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(express.static(path.join(__dirname, "./client/build")));

// Multer Configuration for File Uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    console.log(file);
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// MongoDB User Schema
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  age: Number,
  email: { type: String, unique: true },
  password: String,
  mobile: String,
  profilePic: String,
});

const User = mongoose.model("User", userSchema);

// User Registration Endpoint
app.post("/register", upload.single("profilePic"), async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10); // Hash the password
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      age: req.body.age,
      email: req.body.email,
      password: hashedPassword, // Store hashed password
      mobile: req.body.mobile,
      profilePic: req.file ? req.file.path : null, // Handle profilePic if provided
    });

    await newUser.save();
    res.json({ status: "Success", msg: "User Created Successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "failure", msg: "Unable to create user", err: err.message });
  }
});

// User Login Endpoint
app.post("/login", upload.none(), async (req, res) => {
  try {
    const userDetails = await User.findOne({ email: req.body.email });

    if (userDetails) {
      const isMatch = await bcrypt.compare(req.body.password, userDetails.password); // Compare hashed password
      if (isMatch) {
        const loggedInUserDetails = {
          firstName: userDetails.firstName,
          lastName: userDetails.lastName,
          email: userDetails.email,
          mobile: userDetails.mobile,
          profilePic: userDetails.profilePic,
        };
        return res.json({ status: "success", data: loggedInUserDetails });
      } else {
        return res.status(401).json({ status: "failure", msg: "Invalid Password" });
      }
    } else {
      return res.status(404).json({ status: "failure", msg: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "failure", msg: "Internal Server Error" });
  }
});

// Serve Frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

// MongoDB Connection
const connectToMDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://ramganta778:balaji@cluster0.vhgpcgw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB Successfully");
  } catch (err) {
    console.error("Unable to connect to MongoDB:", err);
  }
};

// Start the Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectToMDB();
});
