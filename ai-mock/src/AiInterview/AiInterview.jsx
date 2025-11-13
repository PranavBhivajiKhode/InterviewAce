"use client"

import { useState }  from "react"
import ResumeUpload from "./ResumeUpload"
import InterviewSession from "./InterviewSession"

export default function AiInterview() {
  const [sessionStarted, setSessionStarted] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [firstMessage, setFirstMessage] = useState(null)

  const handleInterviewStart = (newSessionId, message) => {
    setSessionId(newSessionId)
    setFirstMessage(message)
    setSessionStarted(true)
  }

  const handleInterviewEnd = () => {
    setSessionStarted(false)
    setSessionId(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-600 mb-3">
            InterviewAce
          </h1>
          <p className="text-lg text-gray-600">
            AI-Powered Interview Practice Platform
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-2xl p-8 transition-all duration-300">
          {!sessionStarted ? (
            <ResumeUpload onInterviewStart={handleInterviewStart} />
          ) : (
            <InterviewSession
              sessionId={sessionId}
              firstMessage={firstMessage}
              onInterviewEnd={handleInterviewEnd}
            />
          )}
        </div>
      </div>
    </div>
  )
}
