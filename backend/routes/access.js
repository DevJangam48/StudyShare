const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/authMiddleware");
const {
  requestAccess,
  getRequestsForAuthor,
  updateRequestStatus,
  getMyRequests,
  isRequested,
} = require("../controllers/accessController");

router.post("/request", auth, requestAccess);
router.get("/author/requests", auth, getRequestsForAuthor);
router.get("/my", auth, getMyRequests);
router.patch("/request/:requestId", auth, updateRequestStatus);
router.get("/request-status/:postId", auth, isRequested);
module.exports = router;
