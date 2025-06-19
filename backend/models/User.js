const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  prn: {
    type: String,
    required: true,
    unique: true,
  },
  currentYear: {
    type: String,
    enum: [
      "First Year",
      "Second Year",
      "Third Year",
      "Final Year",
      "Graduated",
    ],
    required: true,
  },
  role: {
    type: String,
    default: "student",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
