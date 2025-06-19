import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const PostDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [msg, setMsg] = useState("");
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentMsg, setCommentMsg] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/posts/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setPost(res.data);
      } catch (err) {
        setMsg("Failed to load post.");
      }
    };
    const fetchComments = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/comments/${id}`);
        setComments(res.data);
      } catch {
        setComments([]);
      }
    };
    fetchPost();
    fetchComments();
  }, [id]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setCommentMsg("");
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `http://localhost:5000/api/comments/${id}`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText("");
      setCommentMsg("Comment added!");
      // Refresh comments
      const res = await axios.get(`http://localhost:5000/api/comments/${id}`);
      setComments(res.data);
    } catch {
      setCommentMsg("Failed to add comment.");
    }
  };

  if (msg) return <div>{msg}</div>;
  if (!post) return <div>Loading...</div>;

  return (
    <div className="container" style={{ maxWidth: 600, margin: "40px auto" }}>
      <h2>{post.title}</h2>
      <p>{post.description}</p>
      <p>
        <b>Tags:</b> {post.tags && post.tags.join(", ")}
      </p>
      <p>
        <b>Author:</b> {post.author?.name || "Unknown"}
      </p>
      <p>
        <b>Visibility:</b> {post.visibility}
      </p>
      <p>
        <b>File:</b>{" "}
        {post.fileUrl && (
          <a
            href={post.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="text-blue-600 underline"
          >
            Download/View
          </a>
        )}
      </p>

      <hr />

      <h3>Comments</h3>
      {comments.length === 0 && <div>No comments yet.</div>}
      <ul>
        {comments.map((c) => (
          <li key={c._id}>
            <b>{c.author?.name || "User"}:</b> {c.text}
          </li>
        ))}
      </ul>
      <form onSubmit={handleCommentSubmit}>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment..."
          required
          style={{ width: "100%", marginBottom: 10 }}
        />
        <button type="submit">Add Comment</button>
      </form>
      {commentMsg && <div>{commentMsg}</div>}
    </div>
  );
};

export default PostDetail;
