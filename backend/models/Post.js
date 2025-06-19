const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  fileUrl: {
    type: String,
    required: true,
  },
  fileType: String, // 'pdf', 'docx', 'code', etc.
  tags: [String],
  visibility: {
    type: String,
    enum: ["public", "private"],
    default: "public",
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  accessRequests: [
    {
      student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: ["pending", "approved", "rejected"],
        default: "pending",
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  cloudinaryId: {
    type: String, // Cloudinary ID for the uploaded file
  },
  uniqueViewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  uniqueDownloaders: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  // In models/Post.js
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  //comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
});

module.exports = mongoose.model("Post", postSchema);
