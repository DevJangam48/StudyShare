const express = require("express");
const router = express.Router();
const { addComment, getComments } = require("../controllers/commentController");
const { protect } = require("../middleware/authMiddleware");
console.log("addComment is", typeof addComment);

router.post("/:postId", protect, addComment);
router.get("/:postId", protect, getComments);

module.exports = router;
