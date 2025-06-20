import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import { FiEdit } from "react-icons/fi";

const PostDetailsWithAnalyticsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState(0);
  const [setMsg] = useState("");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await API.get(`/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPost(res.data);
        setLikes(Array.isArray(res.data.likes) ? res.data.likes.length : 0);
        setComments(res.data.comments || []); // comments come from backend, not from post.comments array
      } catch {
        setMsg("Failed to load post.");
      }
    };
    fetchPost();
  }, [id]);

  if (!post)
    return (
      <div className="text-center text-xl font-semibold mt-10">Loading...</div>
    );

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Post Details */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold">{post.title}</h2>
          <button
            onClick={() => navigate(`/edit-post/${id}`)}
            className="rounded-full bg-indigo-500 text-white shadow hover:bg-indigo-700 transition flex items-center justify-center"
            style={{
              width: "32px",
              height: "32px",
              padding: 0,

              minWidth: 0,
              minHeight: 0,
              lineHeight: 1,
            }}
            title="Edit"
          >
            <FiEdit size={16} />
          </button>
        </div>
        <p className="text-gray-700 mb-2">{post.description}</p>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
          <span>
            <span className="font-bold text-indigo-700">Author:</span>{" "}
            <span className="font-semibold">{post.author?.name}</span>
          </span>
          <span>
            <span className="font-bold text-indigo-700">Tags:</span>{" "}
            <span className="font-semibold">{post.tags?.join(", ")}</span>
          </span>
          <span>
            <span className="font-bold text-indigo-700">Visibility:</span>{" "}
            <span
              className={`font-semibold ${
                post.visibility === "public" ? "text-green-700" : "text-red-700"
              }`}
            >
              {post.visibility}
            </span>
          </span>
        </div>
      </div>

      {/* Document Preview with Analytics */}
      <div className="relative mb-8">
        {/* Analytics - Top Right */}
        <div
          className="absolute top-0 right-0 flex gap-6 bg-white/80 rounded-xl px-4 py-2 shadow"
          style={{ marginTop: "-2.5rem", marginRight: "-1rem" }}
        ></div>
        {/* Document Preview */}
        {post.fileUrl?.endsWith(".pdf") && (
          <iframe
            src={post.fileUrl}
            className="w-full h-[500px] mt-4 rounded-xl border"
            title="PDF Preview"
            allow="fullscreen"
          ></iframe>
        )}

        {(post.fileUrl?.endsWith(".doc") ||
          post.fileUrl?.endsWith(".docx") ||
          post.fileUrl?.endsWith(".ppt") ||
          post.fileUrl?.endsWith(".pptx")) && (
          <div className="w-full h-[500px] mt-4 rounded-xl border flex items-center justify-center bg-gray-50 text-gray-600">
            ⚠️ Preview not supported for this file type.{" "}
            <a
              href={post.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 underline ml-2"
            >
              Download & View
            </a>
          </div>
        )}
        {(post.fileUrl.endsWith(".jpg") ||
          post.fileUrl.endsWith(".jpeg") ||
          post.fileUrl.endsWith(".png")) && (
          <img
            src={post.fileUrl}
            alt="Uploaded Visual"
            className="w-full h-auto mt-4 rounded-xl border"
          />
        )}

        {post.fileUrl.endsWith(".txt") && (
          <iframe
            src={post.fileUrl}
            className="w-full h-[500px] mt-4 rounded-xl border"
            title="Text Preview"
          ></iframe>
        )}
      </div>

      {/* Post Analytics Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-2 flex items-center">
          <span className="text-gray-700 font-medium">👍 {likes} Likes</span>
        </h3>
        {/* Render analytics data here if needed */}
      </div>

      {/* Comments Section */}
      <div className="bg-white border border-gray-300 p-5 rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          💬 Comments from Users
        </h3>
        {comments.length === 0 ? (
          <div className="text-gray-500">No comments yet.</div>
        ) : (
          <ul className="space-y-3 max-h-60 overflow-y-auto mb-4 pr-1 text-sm">
            {comments.map((c, i) => (
              <li
                key={i}
                className="border-b border-gray-200 pb-2 text-gray-700"
              >
                <strong>{c.user?.name || c.user?.email || "Unknown"}</strong>
                <span className="ml-2 text-xs text-gray-500">
                  {new Date(c.createdAt).toLocaleString()}
                </span>
                : {c.text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PostDetailsWithAnalyticsPage;
