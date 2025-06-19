const Comment = require("../models/Comment");
const Post = require("../models/Post");
const AccessRequest = require("../models/AccessRequest");

exports.addComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    // If post is private, ensure requester has access
    if (
      post.visibility === "private" &&
      post.user?.toString() !== req.user.id
    ) {
      const access = await AccessRequest.findOne({
        post: post._id,
        requester: req.user.id,
        status: "approved",
      });

      if (!access) {
        return res
          .status(403)
          .json({ msg: "Access denied to comment on this private post" });
      }
    }

    const comment = await Comment.create({
      post: post._id,
      user: req.user.id,
      text: req.body.text,
    });

    const populatedComment = await comment.populate("user", "name email");
    res.status(201).json(populatedComment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getComments = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    if (
      post.visibility === "private" &&
      post.author.toString() !== req.user.id
    ) {
      const access = await AccessRequest.findOne({
        post: post._id,
        requester: req.user.id,
        status: "approved",
      });

      if (!access) {
        return res
          .status(403)
          .json({ msg: "Access denied to view comments on this private post" });
      }
    }

    const comments = await Comment.find({ post: post._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
