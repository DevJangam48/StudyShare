const Post = require("../models/Post");
const AccessRequest = require("../models/AccessRequest");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

exports.getMyProfile = async (req, res) => {
  try {
    const myPosts = await Post.find({ author: req.user.id });

    const myRequests = await AccessRequest.find({
      requester: req.user.id,
    }).populate("post", "title visibility");

    const approved = myRequests.filter((req) => req.status === "approved");

    res.json({
      uploads: myPosts,
      accessRequests: myRequests,
      approvedResources: approved.map((a) => a.post),
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // exclude password
    if (!user) return res.status(404).json({ msg: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    // Update fields
    user.name = req.body.name || user.name;
    user.currentYear = req.body.currentYear || user.currentYear;

    // If password is provided, hash it
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    await user.save();

    res.json({
      msg: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        currentYear: user.currentYear,
      },
    });
  } catch (err) {
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
};
