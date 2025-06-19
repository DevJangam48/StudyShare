import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FaUpload,
  FaFileAlt,
  FaTags,
  FaHeading,
  FaLock,
  FaLockOpen,
} from "react-icons/fa";

const UploadPost = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState(null);
  const [visibility, setVisibility] = useState("public");
  const [msg, setMsg] = useState("");

  const token = localStorage.getItem("token");

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!title || !description || !file) {
      setMsg("Please fill in all required fields");
      return;
    }

    const fileWithName = new File([file], file.name || "upload.pdf", {
      type: file.type || "application/pdf",
    });

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("tags", tags);
    formData.append("file", fileWithName);
    formData.append("visibility", visibility);
    formData.append("resource_type", "auto");

    try {
      await axios.post("http://localhost:5000/api/posts/create", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setMsg("✅ Post uploaded successfully!");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setMsg("❌ Failed to upload post");
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{
        backgroundImage: `url('https://i.pinimg.com/originals/dd/ca/be/ddcabeb0bbdd9cdb4e5e911c18a4987c.jpg')`,
      }}
    >
      <div className="bg-white/90 backdrop-blur p-8 rounded-xl shadow-lg w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-center mb-6 text-blue-800 flex items-center justify-center gap-2">
          <FaUpload /> Upload a New Post
        </h2>

        {msg && (
          <div className="mb-4 text-center text-red-500 text-sm">{msg}</div>
        )}

        <form onSubmit={handleUpload} className="space-y-5">
          <div className="flex items-center gap-2">
            <FaHeading className="text-gray-500" />
            <input
              type="text"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded focus:outline-blue-400"
              required
            />
          </div>

          <div className="flex items-start gap-2">
            <FaFileAlt className="mt-2 text-gray-500" />
            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded focus:outline-blue-400"
              required
            />
          </div>

          <div className="flex items-center gap-2">
            <FaTags className="text-gray-500" />
            <input
              type="text"
              placeholder="Tags (comma-separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full p-2 border rounded focus:outline-blue-400"
            />
          </div>

          <div className="flex items-center gap-2">
            <FaFileAlt className="text-gray-500" />
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-2 border rounded bg-gray-50 cursor-pointer"
              required
            />
          </div>

          <div className="flex gap-6 items-center justify-start">
            <label className="flex items-center gap-2 text-blue-600">
              <input
                type="radio"
                value="public"
                checked={visibility === "public"}
                onChange={() => setVisibility("public")}
                className="accent-blue-600"
              />
              <FaLockOpen size={50} /> Public
            </label>
            <label className="flex items-center gap-2 text-red-600">
              <input
                type="radio"
                value="private"
                checked={visibility === "private"}
                onChange={() => setVisibility("private")}
                className="accent-red-600"
              />
              <FaLock size={50} /> Private
            </label>
          </div>
          <p className="text-sm text-gray-500">
            ✅ Allowed file types:{" "}
            <code>.pdf, .doc, .docx, .ppt, .pptx, .txt, .jpg, .png</code>
            <br />
            📦 Max file size: <strong>4 MB</strong>
          </p>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 rounded-md flex items-center justify-center gap-2 text-lg font-semibold transition-all duration-300"
          >
            <FaUpload /> Upload Post
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPost;
