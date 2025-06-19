import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCheck, FaTimes } from "react-icons/fa";
import { IoClose } from "react-icons/io5"; // optional: modern close icon

const NotificationsPanel = ({ token, closePanel }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/notifications", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const sorted = res.data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setNotifications(sorted);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    fetchNotifications();
  }, [token]);

  const handleDecision = async (requestId, decision) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/access/request/${requestId}`,
        { status: decision },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.requestId === requestId
            ? { ...notif, status: decision, type: `access_${decision}` }
            : notif
        )
      );
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  const getStatusBadge = (status) => {
    const base = "text-xs px-2 py-1 rounded-full font-semibold";
    if (status === "approved")
      return (
        <span className={`${base} bg-green-100 text-green-700`}>Approved</span>
      );
    if (status === "rejected")
      return (
        <span className={`${base} bg-red-100 text-red-700`}>Rejected</span>
      );
    return (
      <span className={`${base} bg-yellow-100 text-yellow-700`}>Pending</span>
    );
  };

  return (
    <div className="p-8 bg-white rounded-2xl shadow-2xl w-full max-w-5xl mx-auto border border-gray-200 relative">
      {/* Close button */}
      <button
        onClick={closePanel}
        className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-sm p-1 w-10 h-10 rounded-full transition-colors duration-200"
        title="Close"
      >
        <IoClose size={30} color="#ADD8E6" /> {/* or just use &times; */}
      </button>

      <h2 className="text-2xl font-bold mb-5 text-gray-800">Notifications</h2>

      {notifications.length === 0 && (
        <p className="text-gray-500">No notifications found.</p>
      )}

      {notifications.map((notif) => (
        <div
          key={notif._id}
          className="border rounded-md p-4 mb-4 bg-gray-50 shadow-sm"
        >
          <p className="text-gray-700">
            <strong>
              {notif.type === "access_request" ? "Requester" : "From"}:
            </strong>{" "}
            {notif.sender?.name} ({notif.sender?.email})
          </p>

          {notif.sender?.currentYear && (
            <p className="text-gray-700">
              <strong>Year:</strong> {notif.sender.currentYear}
            </p>
          )}

          {notif.post?.title && (
            <p className="text-gray-700">
              <strong>Document:</strong> {notif.post.title}
            </p>
          )}

          {notif.type === "access_request" && (
            <div className="flex justify-between items-center mt-3">
              {getStatusBadge(notif.status)}

              {notif.status === "pending" && (
                <div className="flex items-center gap-2">
                  <FaCheck
                    size={23}
                    className="text-green-500 cursor-pointer"
                    onClick={() => handleDecision(notif.requestId, "approved")}
                  />
                  <FaTimes
                    size={23}
                    className="text-red-500 cursor-pointer"
                    onClick={() => handleDecision(notif.requestId, "rejected")}
                  />
                </div>
              )}

              {notif.status === "approved" && notif.post?._id && (
                <a
                  href={`/posts/${notif.post._id}`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  View Document
                </a>
              )}
            </div>
          )}

          {notif.type === "access_approved" && (
            <div className="mt-3">
              <p className="text-green-700 font-medium">
                ✅ Your access request was approved.
              </p>
              {notif.post?._id && (
                <a
                  href={`/posts/${notif.post._id}`}
                  className="inline-block mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                >
                  View Document
                </a>
              )}
            </div>
          )}

          {notif.type === "access_rejected" && (
            <p className="text-red-500 mt-3 font-medium">
              ❌ Your access request was rejected.
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotificationsPanel;
