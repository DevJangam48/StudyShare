// src/components/PostList.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaLock, FaLockOpen } from "react-icons/fa"; // Only import what you use

const PostList = ({ posts }) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {posts.map((post) => (
        <div
          key={post._id}
          className="bg-white p-4 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => navigate(`/posts/${post._id}`)}
        >
          <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-3">
            {post.description}
          </p>
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
            <span>
              {post.visibility === "private" ? <FaLock /> : <FaLockOpen />}{" "}
              {post.visibility}
            </span>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList;
