"use client";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function DashboardLiveInterview() {
  const navigate = useNavigate();
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 p-6">
      <div className="w-full max-w-lg bg-white shadow-2xl rounded-2xl border border-gray-100 p-10 text-center transition-all duration-300">
        {/* Header */}
        <h2 className="text-4xl font-extrabold text-gray-800 mb-3">
          Welcome to <span className="text-blue-600">InterviewAce</span>
        </h2>
        <p className="text-gray-600 text-lg mb-10">
          Choose your preferred interview type below
        </p>

        {/* Buttons Section */}
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          {/* Show only for student */}
          {role === "student" && (
            <button
              onClick={() => navigate("/ai-interview")}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold text-lg shadow-md hover:bg-blue-700 transition-all duration-200"
            >
              🤖 AI Interview
            </button>
          )}

          {/* Live Interview visible to all */}
          <button
            onClick={() => navigate("/live-interview")}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-green-600 text-white font-semibold text-lg shadow-md hover:bg-green-700 transition-all duration-200"
          >
            🎥 1v1 Live Interview
          </button>
        </div>

        {/* Optional Note */}
        <p className="text-sm text-gray-500 mt-8">
          Prepare, practice, and improve your interview skills with confidence.
        </p>
      </div>
    </div>
  );
}

export default DashboardLiveInterview;
