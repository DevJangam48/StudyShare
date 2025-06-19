import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const UserPanel = ({ closePanel }) => {
  const navigate = useNavigate();
  const panelRef = useRef();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        closePanel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [closePanel]);

  return (
    <div
      ref={panelRef}
      className="bg-white shadow-2xl rounded-xl p-5 w-64 absolute right-4 top-16 z-50 transition-all duration-200 border border-gray-200"
    >
      <ul className="space-y-4 text-gray-800 font-medium">
        <li
          className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition"
          onClick={() => {
            navigate("/profile");
            closePanel();
          }}
        >
          <span role="img" aria-label="Profile">
            👤
          </span>{" "}
          Profile
        </li>
        <li
          className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition"
          onClick={() => {
            navigate("/upload");
            closePanel();
          }}
        >
          <span role="img" aria-label="Upload">
            📤
          </span>{" "}
          Upload Post
        </li>
        <li
          className="flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition"
          onClick={() => {
            navigate("/my-posts");
            closePanel();
          }}
        >
          <span role="img" aria-label="My Posts">
            📁
          </span>{" "}
          My Posts
        </li>
        <li
          className="flex items-center gap-2 cursor-pointer text-red-500 hover:text-red-600 transition"
          onClick={handleLogout}
        >
          <span role="img" aria-label="Logout">
            🚪
          </span>{" "}
          Logout
        </li>
      </ul>
    </div>
  );
};

export default UserPanel;
