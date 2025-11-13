"use client"

import { useEffect, useRef } from "react"

export default function InterviewDisplay({ messages }) {
  const messagesEndRef = useRef(null)
  const lastInterviewerMessageRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const speakMessage = (text) => {
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1
    utterance.pitch = 1
    utterance.volume = 1
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]

      if (
        lastMessage.type === "interviewer" &&
        lastMessage.content !== lastInterviewerMessageRef.current
      ) {
        lastInterviewerMessageRef.current = lastMessage.content
        speakMessage(lastMessage.content)
      }
    }
  }, [messages])

  return (
    <div className="mb-4">
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 min-h-[400px] max-h-[500px] overflow-y-auto shadow-inner">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center">
            <p className="text-base mb-1">Waiting for interview to start...</p>
            <small className="text-gray-400">Your first question will appear here</small>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className="mb-4">
              {/* Interviewer Message */}
              {message.type === "interviewer" ? (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      AI
                    </span>
                  </div>
                  <div className="flex flex-col max-w-[80%]">
                    <div className="bg-blue-600 text-white rounded-2xl rounded-tl-none p-3 shadow-md">
                      <p className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
                        {message.content}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 mt-1">Interviewer</span>
                  </div>
                </div>
              ) : (
                /* User Message */
                <div className="flex items-start gap-3 justify-end">
                  <div className="flex flex-col max-w-[80%]">
                    <div className="bg-white border border-gray-200 rounded-2xl rounded-tr-none p-3 shadow-sm">
                      <p className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                        {message.content}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 mt-1 text-right">You</span>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="bg-gray-400 text-white text-xs font-semibold px-2 py-1 rounded-full">
                      You
                    </span>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
