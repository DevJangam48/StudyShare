import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { useParams, useNavigate } from "react-router-dom";
import { FiThumbsUp, FiDownload, FiShare2, FiArrowLeft } from "react-icons/fi";

const FullPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [likes, setLikes] = useState(0);
  const [download, setDownload] = useState(0);
  const [msg, setMsg] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [checkingRequest, setCheckingRequest] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await API.get(`/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPost(res.data);
        setLikes(res.data.likes?.length || 0);
        setComments(res.data.comments || []);
        setDownload(res.data.downloads?.size || 0);
      } catch (err) {
        if (err.response?.status === 403) {
          setAccessDenied(true);
        } else {
          setMsg("Failed to load post.");
        }
      }
    };
    fetchPost();
  }, [id, token]);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await API.get(`/comments/${post._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setComments(res.data);
      } catch {
        setMsg("Failed to load comments.");
      }
    };

    if (post?._id) fetchComments();
  }, [post]);

  useEffect(() => {
    const checkRequestStatus = async () => {
      try {
        const res = await API.get(`/access/request-status/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRequestSent(res.data.requested);
      } catch (err) {
        console.error("Failed to check request status");
      } finally {
        setCheckingRequest(false);
      }
    };

    if (accessDenied) {
      checkRequestStatus();
    }
  }, [accessDenied, id, token]);

  const handleComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = API.post(
        `/comments/${post._id}`,
        { text: newComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComments((prev) => [...prev, res.data]);
      setNewComment("");
    } catch {
      setMsg("Failed to post comment.");
    }
  };

  const handleLike = async () => {
    try {
      const res = await API.post(
        `/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLikes(res.data.likes);
    } catch (err) {
      alert("Failed to like the post");
    }
  };

  const handleDownload = async () => {
    const downloadUrl = post.fileUrl.replace(
      "/upload/",
      "/upload/fl_attachment/"
    );
    window.open(downloadUrl, "_blank");
  };

  const toggleVisibility = async () => {
    try {
      await API.put(
        `posts/${id}/toggle-visibility`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPost({
        ...post,
        visibility: post.visibility === "public" ? "private" : "public",
      });
    } catch {
      setMsg("Failed to toggle visibility.");
    }
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/dashboard");
    } catch {
      setMsg("Failed to delete the post.");
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: "Check out this post!",
          url: window.location.href,
        })
        .catch(() => setMsg("Sharing failed."));
    } else {
      navigator.clipboard.writeText(window.location.href);
      setMsg("Link copied to clipboard!");
    }
  };

  const handleRequestAccess = async () => {
    try {
      await API.post(
        `/access/request/`,
        { postId: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log(id);
      setRequestSent(true);
    } catch (err) {
      setMsg(err.response?.data?.msg || "Failed to send access request.");
    }
  };

  if (accessDenied) {
    return (
      <div
        className="min-h-screen flex flex-col justify-center items-center bg-gray-100 text-center p-8 relative"
        style={{
          backgroundImage:
            "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3drTTd0oqXIhPKqX2uJCHBNZID9fVCwEqsvspR1NBK9oKnF5kL7pRt4XuGiOcM4rez-I&usqp=CAU')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Top-left back button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="absolute top-4 left-4 w-10 flex items-center text-white bg-black/50 hover:bg-black/70 px-3 py-1 rounded-full text-sm transition z-10"
        >
          <FiArrowLeft className="mr-1" size={20} />←
        </button>

        {/* Access Denied Card */}
        <div className="bg-white shadow-xl rounded-2xl p-10 max-w-md w-full backdrop-blur-md bg-opacity-90 z-10">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            🔒 Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            This post is private. You need permission to view it.
          </p>
          {checkingRequest ? (
            <p>Checking request status...</p>
          ) : requestSent ? (
            <p className="text-green-600 font-medium">
              ✅ Access request sent. Wait for approval.
            </p>
          ) : (
            <button
              onClick={handleRequestAccess}
              className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition"
            >
              Request Access
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!post)
    return (
      <div className="text-center text-white text-xl font-semibold mt-10">
        Loading...
      </div>
    );

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-purple-100 via-indigo-100 to-blue-200 p-6 md:p-10"
      style={{
        backgroundImage:
          "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6_Zmqog1CEP-Mwtxtmb17rlrDheMNQN428nHaH23CyhziXAWMZSUkvbmTrH0dLl3lz0c&usqp=CAU')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-lg shadow-xl rounded-3xl p-8 md:p-10 relative">
        {/* Icon Buttons */}
        <div className="absolute top-4 right-6 flex gap-3">
          <button
            onClick={handleLike}
            title="Like"
            className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700"
          >
            <FiThumbsUp size={20} />{" "}
          </button>
          <button
            onClick={handleShare}
            title="Share"
            className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <FiShare2 size={20} />
          </button>
          <button
            onClick={handleDownload}
            title="Download"
            className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700"
          >
            <FiDownload size={20} />
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            title="Back to Dashboard"
            className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-700"
          >
            <FiArrowLeft size={20} />
          </button>
        </div>

        {/* Content */}
        <h2 className="text-3xl font-extrabold text-indigo-800 mb-2">
          {post.title}
        </h2>
        <p className="text-gray-700 mb-4 text-sm">
          📅 Posted by <b>{post.author?.name}</b> ({post.author?.email})
        </p>

        {msg && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              msg.includes("Failed")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {msg}
          </div>
        )}

        <p className="text-gray-800 leading-relaxed mb-6">{post.description}</p>

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
        {/* Author controls */}
        {post.isAuthor && (
          <div className="mt-6 mb-4 flex gap-4">
            <button
              onClick={toggleVisibility}
              className="px-4 py-2 rounded-full bg-yellow-500 text-white hover:bg-yellow-600 shadow"
            >
              {post.visibility === "public"
                ? "🔒 Make Private"
                : "🌐 Make Public"}
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 shadow"
            >
              🗑️ Delete
            </button>
          </div>
        )}

        {/* Engagement Stats */}
        <div className="flex items-center gap-6 text-gray-600 mb-4">
          <span>👍 {likes} Likes</span>
        </div>

        {/* Comment Section */}
        <div className="bg-white border border-gray-300 p-5 rounded-2xl mt-10 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            💬 Comments
          </h3>
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
          <div className="flex items-center gap-2">
            <textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={2}
              className="flex-1 resize-none border border-gray-300 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              style={{ minWidth: 0, fontSize: 15 }}
            />
            <button
              onClick={handleComment}
              className="flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700"
              title="Send"
              style={{
                width: 32,
                height: 32,
                minWidth: 32,
                minHeight: 32,
                fontSize: 16,
                padding: 0,
                lineHeight: 1,
              }}
            >
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullPostPage;
