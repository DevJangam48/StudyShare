// utils/sendNotification.js
const Notification = require("../models/Notification");

const sendNotification = async ({
  recipient,
  sender,
  post,
  type,
  message,
  requestId,
}) => {
  console.log("Sending Notification:");
  console.log("Recipient:", recipient);
  console.log("Type:", type);
  try {
    const notification = new Notification({
      recipient,
      sender,
      post,
      type,
      message,
      requestId,
    });
    await notification.save();
    console.log("Notification sent successfully:", notification);

    // 🔴 Emit real-time event using Socket.IO if available
    if (global.io) {
      global.io.to(recipient.toString()).emit("new_notification", {
        _id: notification._id,
        sender,
        post,
        type,
        message,
        requestId,
        createdAt: notification.createdAt,
      });
      console.log(`📤 Notification emitted to user ${recipient}`);
    }
  } catch (err) {
    console.error("Notification Error:", err.message);
  }
};

module.exports = sendNotification;
