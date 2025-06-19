const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { name, email, password, prn, currentYear } = req.body;

  if (!/^[\w.-]+@[\w.-]+\.edu$/.test(email)) {
    return res.status(403).json({ msg: "Use institute email only." });
  }

  const existingEmail = await User.findOne({ email });
  const existingPRN = await User.findOne({ prn });
  if (existingEmail)
    return res.status(400).json({ msg: "Email already registered." });
  if (existingPRN) return res.status(400).json({ msg: "PRN already in use." });

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashed,
    prn,
    currentYear,
  });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.status(201).json({ user, token });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ msg: "User not found" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ msg: "Invalid credentials" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ user, token });
};
