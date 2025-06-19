import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css"; // For background image

const quotes = [
  `"Alone we can do so little; together we can do so much." – Helen Keller`,
  `"The beautiful thing about learning is that no one can take it away from you." – B.B. King`,
  `"Success is the sum of small efforts, repeated day in and day out." – Robert Collier`,
  `"The expert in anything was once a beginner." – Helen Hayes`,
  `"Collaboration allows us to know more than we are capable of knowing by ourselves." – Paul Solarz`,
  `"Education is the most powerful weapon which you can use to change the world." – Nelson Mandela`,
];

const TRANSITION_DURATION = 700; // ms
const DISPLAY_DURATION = 2700; // ms

const LandingPage = () => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setShow(false);
      setTimeout(() => {
        setQuoteIndex((prev) => (prev + 1) % quotes.length);
        setShow(true);
      }, TRANSITION_DURATION); // Hide for the duration of the transition
    }, DISPLAY_DURATION + TRANSITION_DURATION);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-container min-h-screen flex flex-col justify-center items-center">
      <div
        className="bg-white bg-opacity-90 p-10 rounded-xl shadow-2xl text-center max-w-2xl w-full"
        style={{ fontFamily: "'Times New Roman', Times, serif" }}
      >
        <h1 className="text-4xl font-bold text-indigo-700 mb-4">
          📘 Welcome to StudyShare!
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          A collaborative platform for students to share and access study
          materials, projects, and ideas.
        </p>
        <div className="h-16 mb-6 flex items-center justify-center relative">
          <blockquote
            className={`
              absolute w-full transition-all duration-700
              ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
              italic text-gray-600
            `}
            style={{ minHeight: "2.5rem" }}
          >
            {quotes[quoteIndex]}
          </blockquote>
        </div>
        <div className="flex justify-center gap-4">
          <Link
            to="/signup"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            Get Started
          </Link>
          <Link
            to="/login"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-2 rounded-lg transition"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
