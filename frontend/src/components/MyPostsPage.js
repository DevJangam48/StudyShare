import {
  FaEye,
  FaArrowLeft,
  FaTags,
  FaLock,
  FaLockOpen,
  FaUpload,
} from "react-icons/fa";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const MyPostsPage = () => {
  const [myPosts, setMyPosts] = useState([]);
  const [msg, setMsg] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/posts/my-posts",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setMyPosts(res.data);
      } catch (err) {
        setMsg("Failed to fetch your posts.");
      }
    };

    fetchMyPosts();
  }, [token]);

  const handleView = (postId) => {
    navigate(`/my-post/${postId}`);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('https://img.freepik.com/free-photo/flat-lay-desk-with-laptop-glasses_23-2148284275.jpg?semt=ais_hybrid&w=740')`,
      }}
    >
      <div className="absolute top-4 right-20 z-10">
        <button
          onClick={() => navigate("/dashboard")}
          className="rounded-full bg-gray-500 text-white shadow hover:bg-gray-700 transition flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            padding: 0,
            minWidth: 0,
            minHeight: 0,
            lineHeight: 1,
          }}
        >
          <FaArrowLeft size={16} />
        </button>
      </div>

      <div className="backdrop-blur-md bg-white/70 min-h-screen py-10 px-6">
        <div className="max-w-5xl mx-auto font-sans">
          <h2 className="text-3xl font-extrabold mb-6 text-gray-800 flex items-center gap-2">
            <FaUpload /> My Uploaded Posts
          </h2>

          {msg && <div className="text-red-600 mb-4">{msg}</div>}

          {myPosts.length === 0 ? (
            <p className="text-gray-700">No posts uploaded yet.</p>
          ) : (
            <ul className="space-y-6">
              {myPosts.map((post) => (
                <li
                  key={post._id}
                  className="rounded-2xl shadow-lg bg-white/90 p-4 relative"
                >
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={() => handleView(post._id)}
                      className="rounded-full bg-blue-500 text-white shadow hover:bg-blue-700 transition flex items-center justify-center"
                      style={{
                        width: 32,
                        height: 32,
                        padding: 0,
                        minWidth: 0,
                        minHeight: 0,
                        lineHeight: 1,
                      }}
                    >
                      <FaEye size={16} />
                    </button>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
                  <p>{post.description}</p>

                  <div className="text-sm text-gray-600 mt-3 flex flex-col sm:flex-row sm:items-center sm:gap-6">
                    <span className="flex items-center gap-1">
                      <FaTags /> {post.tags.join(", ")}
                    </span>
                    <span className="flex items-center gap-1">
                      {post.visibility === "private" ? (
                        <>
                          <FaLock /> Private
                        </>
                      ) : (
                        <>
                          <FaLockOpen /> Public
                        </>
                      )}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPostsPage;
