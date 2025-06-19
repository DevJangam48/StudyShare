const AccessRequest = require("../models/AccessRequest");
const Post = require("../models/Post");
const Notification = require("../models/Notification");
const sendNotification = require("../utils/sendNotification");
const User = require("../models/User");

exports.requestAccess = async (req, res) => {
  const { postId } = req.body;
  const requesterId = req.user.id;

  try {
    const post = await Post.findById(postId).populate("author", "name email");
    if (!post) return res.status(404).json({ msg: "Post not found" });

    // Can't request own post
    if (post.author._id.toString() === requesterId) {
      return res.status(400).json({ msg: "You cannot request your own post" });
    }

    const existing = await AccessRequest.findOne({
      requester: requesterId,
      post: postId,
    });

    if (existing) {
      return res
        .status(400)
        .json({ msg: "Access already requested or granted" });
    }

    const newRequest = new AccessRequest({
      requester: requesterId,
      post: postId,
    });
    await newRequest.save();

    const sender = await User.findById(requesterId).select(
      "name email currentYear"
    );
    // 🔔 Send notification to the post author
    await sendNotification({
      recipient: post.author._id,
      sender: requesterId,
      post: post._id,
      type: "access_request",
      message: `${sender.name} (${sender.email}) [Year: ${sender.currentYear}] requested access to "${post.title}".`,
      requestId: newRequest._id,
    });

    res
      .status(200)
      .json({ msg: "Access request submitted", request: newRequest });
  } catch (err) {
    res.status(500).json({ msg: "Error sending request", error: err.message });
  }
};

exports.getRequestsForAuthor = async (req, res) => {
  try {
    const requests = await AccessRequest.find()
      .populate({
        path: "post",
        match: { author: req.user.id },
        select: "title",
      })
      .populate("requester", "name email");

    const filtered = requests.filter((r) => r.post !== null);
    res.json(filtered);
  } catch (err) {
    res
      .status(500)
      .json({ msg: "Error fetching requests", error: err.message });
  }
};

exports.updateRequestStatus = async (req, res) => {
  const { requestId } = req.params;
  const { status } = req.body;

  try {
    const request = await AccessRequest.findById(requestId).populate("post");
    if (!request) return res.status(404).json({ msg: "Request not found" });

    if (request.post.author.toString() !== req.user.id) {
      return res.status(403).json({ msg: "Not authorized" });
    }

    request.status = status;
    await request.save();

    await Notification.findOneAndUpdate(
      { requestId: request._id, type: "access_request" },
      { status: status }
    );
    // 🔔 Send notification to the requester
    const notifType =
      status === "approved" ? "access_approved" : "access_rejected";
    const message =
      status === "approved"
        ? `Your request to access "${request.post.title}" was approved.`
        : `Your request to access "${request.post.title}" was rejected.`;

    await sendNotification({
      recipient: request.requester,
      sender: req.user.id,
      post: request.post._id,
      type: notifType,
      message,
      requestId: request._id,
      status: "pending", // Set to pending for the notification
    });

    res.json({ msg: `Request ${status}`, request });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error updating request", error: err.message });
  }
};

// 🟡 Optional: Requester's view of all their access requests
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await AccessRequest.find({
      requester: req.user.id,
    }).populate("post", "title visibility");

    res.json(requests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

exports.isRequested = async (req, res) => {
  try {
    const existing = await AccessRequest.findOne({
      requester: req.user.id,
      post: req.params.postId,
    });
    res.json({ requested: !!existing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error", error: err.message });
  }
};
