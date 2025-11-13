"use client"

import { useState } from "react"
import axios from "axios"

export default function ResumeUpload({ onInterviewStart }) {
  const [resume, setResume] = useState(null)
  const [jobDescription, setJobDescription] = useState(null)
  const [difficultyLevel, setDifficultyLevel] = useState("")
  const [interviewType, setInterviewType] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleResumeChange = (e) => {
    setResume(e.target.files[0] || null)
  }

  const handleJDChange = (e) => {
    setJobDescription(e.target.files[0] || null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!resume) {
      setError("Please upload your resume")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("resume", resume)
      if (jobDescription) formData.append("jobDescription", jobDescription)
      if (difficultyLevel) formData.append("difficultyLevel", difficultyLevel)
      if (interviewType) formData.append("interviewType", interviewType)

      const response = await axios.post(
        "http://localhost:8080/api/interview/start",
        formData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      const sessionId = response.headers["x-session-id"]
      const message = response.data

      if (sessionId) {
        onInterviewStart(sessionId, message)
      } else {
        throw new Error("Session ID not found in response headers")
      }
    } catch (err) {
      setError(err.message || "An error occurred while starting the interview")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white shadow-lg rounded-2xl p-8 border border-gray-100">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Start Your AI Interview
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* ✅ Resume Upload (Required) */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Upload Resume <span className="text-red-500">(Required)</span>
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleResumeChange}
            disabled={loading}
            required
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* ✅ Job Description Upload (Optional) */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Upload Job Description (Optional)
          </label>
          <input
            type="file"
            accept=".pdf"
            onChange={handleJDChange}
            disabled={loading}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* ✅ Difficulty Level */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Difficulty Level (Optional)
          </label>
          <select
            value={difficultyLevel}
            onChange={(e) => setDifficultyLevel(e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Default (Medium)</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* ✅ Interview Type */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Interview Type (Optional)
          </label>
          <select
            value={interviewType}
            onChange={(e) => setInterviewType(e.target.value)}
            disabled={loading}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Default (Technical)</option>
            <option value="Technical">Technical</option>
            <option value="HR">HR</option>
            <option value="Behavioral">Behavioral</option>
          </select>
        </div>

        {/* ✅ Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        {/* ✅ Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 text-white font-semibold rounded-lg transition-colors duration-200 ${
            loading
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Starting Interview..." : "Start Interview"}
        </button>
      </form>
    </div>
  )
}
