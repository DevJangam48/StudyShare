const Post = require("../models/Post");
const cloudinary = require("../config/cloudinary");
const AccessRequest = require("../models/AccessRequest");
const Comment = require("../models/Comment");
const path = require("path");

// ✅ Utility function to map MIME type to Cloudinary resource_type
function getCloudinaryResourceType(mimeType) {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  return "raw"; // default for docs, zips, pdfs, etc.
}

exports.createPost = async (req, res) => {
  try {
    const { title, description, tags, visibility } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ msg: "File is required" });

    const ext = path.extname(file.originalname); // get the original file extension
    const baseName = path.basename(file.originalname, ext); // get filename without extension

    const result = await cloudinary.uploader.upload(file.path, {
      resource_type: "raw",
      public_id: `uploads/${baseName}`, // this keeps filename
      format: ext.replace(".", ""), // pass extension without dot
    });

    const post = await Post.create({
      title,
      description,
      tags: tags ? tags.split(",") : [],
      fileUrl: result.secure_url,
      fileType: file.mimetype,
      visibility,
      author: req.user.id,
      cloudinaryId: result.public_id,
    });

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server Error" });
  }
};

exports.getAllPublicPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 }) // 👈 Sort newest to oldest
      .limit(20) // 👈 Optional: limit to top 20 posts
      .populate("author", "name email");
    res.json(posts);
  } catch (err) {
    console.error("Error fetching public posts:", err);
    res.status(500).json({ msg: "Failed to fetch public posts" });
  }
};

exports.getMyPosts = async (req, res) => {
  const posts = await Post.find({ author: req.user.id });
  res.json(posts);
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name email")
      .populate("likes", "name email");

    if (!post) return res.status(404).json({ msg: "Post not found" });

    // 🔒 If the post is private, check access
    if (post.visibility === "private") {
      // Only the author can view by default
      if (req.user.id !== post.author._id.toString()) {
        const access = await AccessRequest.findOne({
          post: post._id,
          requester: req.user.id,
          status: "approved",
        });

        if (!access) {
          return res
            .status(403)
            .json({ msg: "Access denied. Request access to view this post." });
        }
      }
    }
    if (!post.uniqueViewers.includes(req.user.id)) {
      post.uniqueViewers.push(req.user.id);
      //post.views += 1;
      await post.save();
    }
    // Fetch all comments for this post, with user info
    const comments = await Comment.find({ post: post._id })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    const postDoc = post.toObject();
    postDoc.comments = comments;
    postDoc.isAuthor = post.author._id.toString() === req.user.id;

    res.json(postDoc);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    // Only the author can delete the post
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    if (post.cloudinaryId) {
      try {
        const resourceType = getCloudinaryResourceType(post.fileType);
        await cloudinary.uploader.destroy(post.cloudinaryId, {
          resource_type: resourceType,
        });
      } catch (cloudErr) {
        console.error("Cloudinary delete error:", cloudErr);
      }
    }

    await AccessRequest.deleteMany({ post: post._id }); // Remove all access requests for this post
    //await post.remove();
    await Post.deleteOne({ _id: req.params.id });

    res.json({ msg: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.searchPosts = async (req, res) => {
  try {
    const { q, tags, year } = req.query;
    const query = {};

    if (q) {
      query.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ];
    }

    if (tags) {
      const tagArray = tags.split(",").map((tag) => tag.trim());
      query.tags = { $in: tagArray };
    }

    const allPosts = await Post.find(query).populate(
      "author",
      "name email currentYear"
    );

    const processed = await Promise.all(
      allPosts.map(async (post) => {
        if (post.visibility === "public") {
          return {
            ...post.toObject(),
            accessGranted: true,
          };
        }

        if (post.author._id.toString() === req.user.id) {
          return {
            ...post.toObject(),
            accessGranted: true,
          };
        }

        const access = await AccessRequest.findOne({
          post: post._id,
          requester: req.user.id,
          status: "approved",
        });

        if (access) {
          return {
            ...post.toObject(),
            accessGranted: true,
          };
        }

        return {
          _id: post._id,
          title: post.title,
          description: post.description.slice(0, 100) + "...",
          visibility: "private",
          accessGranted: false,
          author: {
            _id: post.author._id,
            name: post.author.name,
          },
        };
      })
    );

    res.json(processed);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.downloadPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) return res.status(404).json({ msg: "Post not found" });

    // Public post - allow directly
    if (post.visibility === "public") {
      return res.json({ url: post.fileUrl });
    }

    // Private - check if user has approved access
    const hasAccess = await AccessRequest.findOne({
      post: post._id,
      requester: req.user.id,
      status: "approved",
    });

    if (!hasAccess) {
      return res.status(403).json({ msg: "Access not granted for this post" });
    }
    // Only count unique downloads
    if (!post.uniqueDownloaders.includes(req.user.id)) {
      post.uniqueDownloaders.push(req.user.id);
      //post.downloads += 1;
      await post.save();
    }

    res.json({ url: post.fileUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.getMyAnalytics = async (req, res) => {
  try {
    const posts = await Post.find({ author: req.user.id });

    const analytics = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await Comment.countDocuments({ post: post._id });

        const accessStats = await AccessRequest.aggregate([
          { $match: { post: post._id } },
          {
            $group: {
              _id: "$status",
              count: { $sum: 1 },
            },
          },
        ]);

        const accessSummary = {
          pending: 0,
          approved: 0,
          rejected: 0,
        };

        accessStats.forEach((stat) => {
          accessSummary[stat._id] = stat.count;
        });

        return {
          postId: post._id,
          title: post.title,
          uniqueDownloaders: post.uniqueDownloaders.length,
          uniqueViewers: post.uniqueViewers.length,
          comments: commentCount,
          accessRequests: accessSummary,
        };
      })
    );

    res.json(analytics);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ msg: "Failed to load analytics", error: err.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    // Toggle like
    const userId = req.user.id;
    const index = post.likes.indexOf(userId);
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }
    await post.save();
    res.json({ likes: post.likes.length });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
};
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ msg: "Post not found" });

    // Optional: Only allow the author to update
    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    post.title = req.body.title;
    post.description = req.body.description;
    post.tags = req.body.tags;
    post.visibility = req.body.visibility;

    if (req.body.fileUrl) {
      post.fileUrl = req.body.fileUrl;
      post.fileType = req.body.fileType;
    }
    await post.save();
    res.json({ msg: "Post updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};
