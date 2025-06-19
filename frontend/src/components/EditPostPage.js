import React, { useEffect, useState } from "react";
import API from "../utils/api";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSave, FiTrash2 } from "react-icons/fi";

const CLOUDINARY_PRESET = process.env.REACT_APP_CLOUDINARY_PRESET;
const CLOUDINARY_CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;

const EditPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [post, setPost] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await API.get(`/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPost(res.data);
        setTitle(res.data.title);
        setDescription(res.data.description);
        setTags(res.data.tags?.join(", ") || "");
        setVisibility(res.data.visibility);
      } catch {
        setMsg("Failed to load post.");
      }
    };
    fetchPost();
  }, [id, token]);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      let fileUrl = post.fileUrl;
      let fileType = post.fileType;

      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CLOUDINARY_PRESET);

        const getResourceType = (file) => {
          if (!file || !file.type) return "raw";
          if (file.type.startsWith("image/")) return "image";
          if (file.type.startsWith("video/")) return "video";
          return "raw";
        };

        const resourceType = getResourceType(file);
        const uploadRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
          formData
        );

        fileUrl = uploadRes.data.secure_url;
        fileType = uploadRes.data.resource_type;
      }

      const response = API.post(
        `/posts/${id}`,
        {
          title,
          description,
          tags: tags.split(",").map((t) => t.trim()),
          visibility,
          fileUrl,
          fileType,
        },
        { headers: { Authorization: `Bearer ${token}` }, responseType: "json" }
      );
      console.log(response);
      setMsg("Post updated successfully!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      console.error(err);
      setMsg("Failed to update post.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await API.delete(`/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/dashboard");
    } catch {
      setMsg("Failed to delete post.");
    }
  };

  if (!post)
    return (
      <div className="text-center mt-20 text-2xl text-white">Loading...</div>
    );

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center px-4"
      style={{
        backgroundImage: `url('https://www.digitalplatforms.co.za/wp-content/uploads/2015/11/Website-Design-Background.jpg')`,
      }}
    >
      <div
        className="max-w-xl mx-auto p-6 rounded-2xl shadow-lg mt-10 relative"
        style={{
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        {/* Top-right Update & Delete Buttons */}
        <div className="absolute top-4 right-4 flex gap-2 z-10">
          {/* Update Button with Custom Tooltip */}
          <div className="relative group inline-block">
            <button
              type="submit"
              form="edit-post-form"
              className="rounded-full bg-indigo-600 text-white shadow hover:bg-indigo-700 transition flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                padding: 0,
                minWidth: 0,
                minHeight: 0,
                lineHeight: 1,
              }}
            >
              <FiSave size={16} />
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition">
              Update
            </span>
          </div>
          {/* Delete Button with Custom Tooltip */}
          <div className="relative group inline-block">
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-full bg-red-600 text-white shadow hover:bg-red-700 transition flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                padding: 0,
                minWidth: 0,
                minHeight: 0,
                lineHeight: 1,
              }}
            >
              <FiTrash2 size={16} />
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition">
              Delete
            </span>
          </div>
        </div>

        {/* Back Button */}
        <div className="relative group inline-block mb-4">
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
            <FiArrowLeft size={16} />
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 rounded bg-black text-white text-xs opacity-0 group-hover:opacity-100 pointer-events-none transition">
            Back
          </span>
        </div>

        {/* Edit Form */}
        <form
          id="edit-post-form"
          onSubmit={handleUpdate}
          className="space-y-4 mt-4"
        >
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows="4"
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
            required
          />
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">
              Visibility
            </label>
            <div className="relative w-48 h-10 bg-gray-100 rounded-full flex items-center shadow-inner">
              {/* Sliding indicator */}
              <div
                className={`absolute top-1 left-1 h-8 rounded-full bg-indigo-500/80 transition-transform duration-300 shadow ${
                  visibility === "public" ? "translate-x-0" : "translate-x-24"
                }`}
                style={{ width: "88px" }}
              ></div>
              {/* Public Button */}
              <button
                type="button"
                className={`relative z-10 flex-1 h-8 rounded-full flex items-center justify-center font-semibold transition-colors duration-300 ${
                  visibility === "public"
                    ? "text-white"
                    : "text-indigo-700 hover:bg-indigo-100"
                }`}
                onClick={() => setVisibility("public")}
                style={{ width: "88px" }}
              >
                🌐 Public
              </button>
              {/* Private Button */}
              <button
                type="button"
                className={`relative z-10 flex-1 h-8 rounded-full flex items-center justify-center font-semibold transition-colors duration-300 ${
                  visibility === "private"
                    ? "text-white"
                    : "text-indigo-700 hover:bg-indigo-100"
                }`}
                onClick={() => setVisibility("private")}
                style={{ width: "88px" }}
              >
                🔒 Private
              </button>
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Replace File (optional):
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-1 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostPage;
