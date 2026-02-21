const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Logic for User Registration
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists in DB
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    // Encrypt the password using Bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save the new user to MongoDB
    user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ msg: "User registered successfully!" });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};

// Logic for User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Verify if user email exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid Credentials" });

    // 2. Compare the entered password with the hashed password in DB
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });

    // 3. Generate a JWT Token for authentication
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    // Return token and user data (except password)
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).send("Server Error");
  }
};
