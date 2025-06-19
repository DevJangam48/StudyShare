import React, { useState, useEffect } from "react";
import { FaBell, FaUser } from "react-icons/fa";
import axios from "axios";
import PostList from "../components/PostList";
import UserPanel from "../components/UserPanel";
import NotificationPanel from "../components/NotificationPage";

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [userPanelOpen, setUserPanelOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const token = localStorage.getItem("token");
  useEffect(() => {
    const fetchRecentPosts = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/posts/public`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPosts(res.data);
      } catch (err) {
        console.error("Error fetching recent posts", err);
      }
    };

    fetchRecentPosts();
  }, []);

  const filteredPosts = posts.filter((post) => {
    if (!searchTerm) return true;
    const lowerSearch = searchTerm.toLowerCase();
    const titleMatch = post.title?.toLowerCase().includes(lowerSearch);
    const tagsMatch = Array.isArray(post.tags)
      ? post.tags.some((tag) => tag.toLowerCase().includes(lowerSearch))
      : false;
    return titleMatch || tagsMatch;
  });

  return (
    <div
      className="min-h-screen bg-cover bg-center relative p-4 md:p-8"
      style={{
        backgroundImage:
          "url('https://i.pinimg.com/originals/a3/c4/94/a3c494dd02285b65db8a538926967074.jpg')",
        filter: "brightness(1.15)", // Make background a bit brighter
      }}
    >
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-30 z-0"></div>{" "}
      {/* less opacity for brighter look */}
      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Top Navbar */}
        <div className="flex flex-col md:flex-row justify-between items-center border border-white/30 shadow-lg p-4 rounded-xl mb-6 bg-transparent">
          {" "}
          {/* bg removed */}
          <h2 className="text-3xl font-bold text-white drop-shadow-lg mb-4 md:mb-0">
            📚 Student Share
          </h2>
          {/* Centered Search Bar */}
          <form
            className="flex items-center w-full md:w-1/2 lg:w-1/3 mx-auto rounded-full overflow-hidden shadow-inner border-2 border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500 transition-all bg-transparent"
            style={{ minWidth: 240, maxWidth: 480, height: 45 }} // Reduced height for better vertical alignment
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="text"
              placeholder="Search posts by title or tag..."
              className="flex-1 outline-none px-6 py-1 text-base bg-white/80 text-gray-800 placeholder-gray-500 rounded-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                border: "none",
                fontFamily: "'Times New Roman', Times, serif",
                fontStyle: "italic",
                fontSize: "15px", // Smaller placeholder and input text
                height: "60px", // <-- Set input height to 45px
                lineHeight: "60px", // Vertically center text
              }}
            />
          </form>
          {/* Icons */}
          <div className="flex items-center gap-6 mt-4 md:mt-0">
            <FaBell
              title="Notifications"
              className="text-2xl text-yellow-400 cursor-pointer hover:text-yellow-500 transition-transform transform hover:scale-110"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
            />
            <FaUser
              title="Profile"
              className="text-2xl text-cyan-400 cursor-pointer hover:text-cyan-300 transition-transform transform hover:scale-110"
              onClick={() => setUserPanelOpen(!userPanelOpen)}
            />
            {/* 👇 Render the UserPanel conditionally */}
            {userPanelOpen && (
              <UserPanel closePanel={() => setUserPanelOpen(false)} />
            )}
          </div>
        </div>

        {/* Quote Box 
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-xl shadow-xl mb-6 text-center text-lg font-medium italic animate-pulse">
          “The beautiful thing about learning is that no one can take it away
          from you.” — B.B. King
        </div>*/}

        {/* Post Feed */}
        <div className="backdrop-blur-lg bg-white/20 p-6 rounded-2xl shadow-2xl border border-white/30">
          <h3 className="text-2xl font-semibold text-white mb-4">
            📰 Recent Posts
          </h3>
          <PostList posts={filteredPosts} />
        </div>

        {/* Panels 
        {userPanelOpen && (
          <div className="absolute top-24 right-8 z-50 animate-slide-in">
            <div className="bg-white/90 shadow-2xl rounded-xl p-6 w-72">
              <UserPanel closePanel={() => setUserPanelOpen(false)} />
            </div>
          </div>
        )}*/}
        {notificationsOpen && (
          <div className="fixed top-24 right-24 z-50 animate-slide-in">
            <div className="bg-white/90 shadow-2xl rounded-xl p-6 w-[650px] max-h-[80vh] overflow-y-auto z-50">
              <NotificationPanel
                token={token}
                closePanel={() => setNotificationsOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
