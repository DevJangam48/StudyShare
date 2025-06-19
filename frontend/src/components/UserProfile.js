import React, { useEffect, useState } from "react";
import API from "../utils/api";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // read-only
  const [currentYear, setCurrentYear] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [msg, setMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const yearOptions = [
    "First Year",
    "Second Year",
    "Third Year",
    "Final Year",
    "Graduated",
  ];

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get(`/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const user = res.data;
        setName(user.name);
        setEmail(user.email);
        setCurrentYear(user.currentYear);
      } catch (err) {
        setMsg("Failed to load profile");
      }
    };
    fetchProfile();
  }, [token]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      setMsg("Passwords do not match");
      return;
    }

    try {
      const res = await API.put(
        `/users/profile`,
        { name, currentYear, password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMsg(res.data.msg || "Profile updated successfully");
      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => navigate("/dashboard"), 2000); // redirect after 2s
    } catch (err) {
      setMsg("Update failed: " + (err.response?.data?.msg || err.message));
      setSuccess(false);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-indigo-100 to-white p-6">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">
          My Profile
        </h2>

        {msg && (
          <p
            className={`text-center text-sm mb-4 ${
              success ? "text-green-600" : "text-red-500"
            }`}
          >
            {msg}
          </p>
        )}

        <form onSubmit={handleUpdate} className="space-y-5">
          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Name
            </label>
            <input
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-indigo-500"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Email (read-only)
            </label>
            <input
              className="w-full border px-4 py-2 rounded-md bg-gray-100 cursor-not-allowed"
              value={email}
              disabled
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Current Year
            </label>
            <select
              className="w-full border border-gray-300 px-4 py-2 rounded-md focus:ring-2 focus:ring-indigo-500"
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
              required
            >
              <option value="" disabled>
                Select year
              </option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              New Password (optional)
            </label>
            <input
              className="w-full border px-4 py-2 rounded-md"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>

          <div>
            <label className="block mb-1 font-semibold text-gray-700">
              Confirm Password
            </label>
            <input
              className="w-full border px-4 py-2 rounded-md"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition font-semibold"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
