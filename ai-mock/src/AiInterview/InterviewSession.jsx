"use client"

import { useState, useEffect } from "react"
import InterviewDisplay from "./InterviewDisplay"
import AnswerInput from "./AnswerInput"
import InterviewSummary from "./InterviewSummary"

export default function InterviewSession({ sessionId, firstMessage }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [interviewEnded, setInterviewEnded] = useState(false)
  const [finalFeedback, setFinalFeedback] = useState(null)

  useEffect(() => {
    const firstInterviewerMessage = {
      type: "interviewer",
      content: firstMessage,
    }
    setMessages([firstInterviewerMessage])
  }, [sessionId, firstMessage])

  const handleAnswerSubmit = async (answer) => {
    if (!answer.trim()) {
      setError("Please provide an answer")
      return
    }

    setLoading(true)
    setError(null)

    try {
      setMessages((prev) => [...prev, { type: "user", content: answer }])

      const response = await fetch("http://localhost:8080/api/interview/turn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: `SESSION=${sessionId}`,
        },
        body: JSON.stringify({ answer }),
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to get interviewer response")

      const data = await response.text()
      setMessages((prev) => [...prev, { type: "interviewer", content: data }])
    } catch (err) {
      setError(err.message || "An error occurred")
      console.error("Error:", err)
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setLoading(false)
    }
  }

  const handleEndInterview = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:8080/api/interview/end", {
        method: "GET",
        headers: {
          Cookie: `SESSION=${sessionId}`,
        },
        credentials: "include",
      })

      if (!response.ok) throw new Error("Failed to get final feedback")

      const feedback = await response.json()
      setFinalFeedback(feedback)
      setInterviewEnded(true)
    } catch (err) {
      setError(err.message || "An error occurred while ending the interview")
      console.error("Error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (interviewEnded) {
    return <InterviewSummary feedback={finalFeedback} />
  }

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl border border-gray-100 p-8 mt-10 transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Interview Session</h2>
        <button
          onClick={handleEndInterview}
          disabled={loading}
          className={`px-5 py-2.5 rounded-lg text-sm font-semibold border transition-all duration-200 shadow-sm ${
            loading
              ? "bg-red-300 border-red-300 text-white cursor-not-allowed"
              : "bg-white border-red-500 text-red-600 hover:bg-red-50 hover:shadow-md"
          }`}
        >
          {loading ? "Ending..." : "End Interview"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="relative mb-5 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-2 right-3 text-red-600 hover:text-red-800 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Messages Section */}
      <div className="mb-6 bg-gray-50 rounded-xl border border-gray-200 p-4 max-h-[500px] overflow-y-auto">
        <InterviewDisplay messages={messages} />
      </div>

      {/* Input Section */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 pt-4">
        <AnswerInput onSubmit={handleAnswerSubmit} loading={loading} disabled={loading} />
      </div>
    </div>
  )
}
