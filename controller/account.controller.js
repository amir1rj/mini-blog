const { validationResult } = require("express-validator");
const User = require("../model/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
module.exports.register = async (req, res) => {
  const { email, username, password, fullname, confirm_password } = req.body;

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Create new user
    const newUser = await User.create({
      email: email,
      username: username,
      password: password,
      fullname: fullname,
    });

    // Send success response
    return res.status(201).json({
      message: "Your account has been created successfully",
      user: newUser,
    });
  } catch (err) {
    console.error("Error registering user:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, "amir-dev-back-end", {
      expiresIn: "24h",
    });

    // Send token in response
    res.json({ token });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// Get all users
module.exports.get_all_users = async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Get a user by ID
module.exports.get_user = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// Delete a user by ID
module.exports.delete_user = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// Edit user details
module.exports.edit_user = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: "User not found1" });
    }
    const userId = req.userId;
   
    const current_user = await User.findByPk(userId);
    if (!current_user) {
      return res.status(404).json({ message: "User not found2" });
    }
    if (current_user.status !== "admin" && id !== userId.toString()) {
      return res
        .status(403)
        .json({
          message: "Unauthorized: You are not allowed to edit other users",
        });
    }

    // Update user details based on the parameters sent in the request body
    Object.keys(updates).forEach((key) => {
      user[key] = updates[key];
    });

    await user.save();
    res
      .status(200)
      .json({ message: "User details updated successfully", user });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Failed to update user details" });
  }
};
