import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import Navbar from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import UploadPost from "./components/UploadPost";
import PostList from "./components/PostList";
import UserProfile from "./components/UserProfile";
import MyPosts from "./components/MyPostsPage";
//import PostDetail from "./components/PostDetail";
import FullPostPage from "./components/FullPostPage";
import PostDetailsWithAnalyticsPage from "./components/PostDetailsWithAnalyticsPage";
import EditPostPage from "./components/EditPostPage";
import "./App.css"; // Assuming you have some global styles
import { useEffect } from "react";
import socket from "./socket";
import { useSelector } from "react-redux"; // or your auth context
import { useDispatch } from "react-redux";
import { addNotification } from "./redux/notificationSlice";

const App = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user); // safe access

  useEffect(() => {
    if (user?._id) {
      socket.emit("join", user._id); // user joins their private room
    }
  }, [user]);

  useEffect(() => {
    socket.on("new_notification", (notif) => {
      console.log("🔔 New Notification:", notif);
      dispatch(addNotification(notif)); // Push to Redux state
    });

    return () => {
      socket.off("new_notification");
    };
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPost />} />
        <Route path="/posts" element={<PostList />} />
        <Route path="/posts/:id" element={<FullPostPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/my-posts" element={<MyPosts />} />
        <Route path="/my-post/:id" element={<PostDetailsWithAnalyticsPage />} />
        <Route path="/edit-post/:id" element={<EditPostPage />} />
      </Routes>
    </Router>
  );
};

export default App;
