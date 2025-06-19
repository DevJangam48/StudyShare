const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const { auth } = require("../middleware/authMiddleware");
const { getMyAnalytics } = require("../controllers/postController");
const {
  createPost,
  getAllPublicPosts,
  getMyPosts,
  getPostById,
  searchPosts,
  downloadPost,
  likePost,
  updatePost,
  deletePost,
} = require("../controllers/postController");

router.get("/search", auth, searchPosts);
router.post("/create", auth, upload.single("file"), createPost);
router.get("/public", getAllPublicPosts);
router.get("/my-posts", auth, getMyPosts);
router.get("/:id", auth, getPostById);
router.get("/download/:id", auth, downloadPost);
router.get("/my/analytics", auth, getMyAnalytics);
router.post("/:id/like", auth, likePost);
router.put("/:id", auth, updatePost);
router.delete("/:id", auth, deletePost);
module.exports = router;
