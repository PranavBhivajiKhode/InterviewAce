"use client"

import { useState, useRef, useEffect } from "react"

export default function AnswerInput({ onSubmit, loading, disabled }) {
  const [answer, setAnswer] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [transcribingText, setTranscribingText] = useState("")
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerIntervalRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = "en-US"

      recognitionRef.current.onstart = () => setTranscribingText("")
      recognitionRef.current.onresult = (event) => {
        let interim = "", final = ""
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          event.results[i].isFinal ? (final += transcript + " ") : (interim += transcript)
        }
        if (final) setAnswer((prev) => prev + final)
        setTranscribingText(interim)
      }
      recognitionRef.current.onerror = (e) => console.error("Speech recognition error:", e.error)
      recognitionRef.current.onend = () => setTranscribingText("")
    }

    return () => recognitionRef.current?.abort()
  }, [])

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data)
      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      recognitionRef.current?.start()

      timerIntervalRef.current = setInterval(() => setRecordingTime((t) => t + 1), 1000)
    } catch (error) {
      console.error("Mic access error:", error)
      alert("Unable to access microphone. Please check permissions.")
    }
  }

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
      recognitionRef.current?.stop()
      clearInterval(timerIntervalRef.current)
      setIsRecording(false)
      setRecordingTime(0)
    }
  }

  const handleClearAnswer = () => {
    setAnswer("")
    setTranscribingText("")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (answer.trim()) {
      onSubmit(answer)
      setAnswer("")
      setTranscribingText("")
    }
  }

  const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Recording Section */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Your Answer (Audio)</label>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {isRecording && (
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    Recording
                  </span>
                  <span className="text-red-500 font-semibold text-sm">{formatTime(recordingTime)}</span>
                </div>
              )}
              {!isRecording && answer && (
                <span className="bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">Recorded</span>
              )}
              {!isRecording && !answer && (
                <span className="text-gray-400 text-sm">Ready to record</span>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {!isRecording ? (
              <button
                type="button"
                onClick={handleStartRecording}
                disabled={disabled}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition disabled:bg-gray-300"
              >
                🎤 Start Recording
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStopRecording}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition"
              >
                ⏹ Stop Recording
              </button>
            )}

            {answer && (
              <button
                type="button"
                onClick={handleClearAnswer}
                disabled={disabled}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Transcribed Text Section */}
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Transcribed Text</label>
        <div className="border border-gray-300 bg-white rounded-lg p-3 min-h-[100px] max-h-[200px] overflow-y-auto text-sm">
          <div className="mb-2">
            {answer || <span className="text-gray-400">Your transcribed text will appear here...</span>}
          </div>
          {transcribingText && (
            <div className="text-gray-700 italic text-xs">
              <em>{transcribingText}</em>
            </div>

          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">{answer.length} characters</p>
      </div>

      {/* Submit Button */}
      <div>
        <button
          type="submit"
          disabled={disabled || !answer.trim()}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg text-lg transition disabled:bg-gray-300"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                ></path>
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Answer"
          )}
        </button>
      </div>
    </form>
  )
}
