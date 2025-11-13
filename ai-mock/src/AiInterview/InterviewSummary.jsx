"use client"

export default function InterviewSummary({ feedback }) {
  if (!feedback) {
    return (
      <div className="bg-white shadow-lg rounded-2xl border border-gray-100 p-6">
        <p className="text-gray-600">No feedback available</p>
      </div>
    )
  }

  return (
    <div className="bg-white shadow-lg rounded-2xl border border-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Interview Summary</h1>
        <p className="text-gray-600">Your comprehensive interview feedback and evaluation</p>
      </div>

      {/* Overall Performance */}
      {feedback.overallPerformance && (
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <h2 className="text-2xl font-bold text-blue-900 mb-3">Overall Performance</h2>
          <div className="flex items-center gap-4 mb-3">
            <div className="text-5xl font-bold text-blue-600">{feedback.overallPerformance.rating?.toFixed(1)}</div>
            <div className="text-lg text-blue-800">/10</div>
          </div>
          <p className="text-blue-900">{feedback.overallPerformance.summary}</p>
        </div>
      )}

      {/* Final Verdict */}
      {feedback.finalVerdict && (
        <div
          className={`mb-8 p-6 rounded-lg border-2 ${
            feedback.finalVerdict.status === "PASS"
              ? "bg-green-50 border-green-300"
              : feedback.finalVerdict.status === "FAIL"
                ? "bg-red-50 border-red-300"
                : "bg-yellow-50 border-yellow-300"
          }`}
        >
          <h2
            className={`text-2xl font-bold mb-2 ${
              feedback.finalVerdict.status === "PASS"
                ? "text-green-900"
                : feedback.finalVerdict.status === "FAIL"
                  ? "text-red-900"
                  : "text-yellow-900"
            }`}
          >
            Final Verdict: {feedback.finalVerdict.status}
          </h2>
          <p
            className={`text-lg ${
              feedback.finalVerdict.status === "PASS"
                ? "text-green-800"
                : feedback.finalVerdict.status === "FAIL"
                  ? "text-red-800"
                  : "text-yellow-800"
            }`}
          >
            {feedback.finalVerdict.summary}
          </p>
        </div>
      )}

      {/* Evaluation Metrics */}
      {feedback.evaluationMetrics && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Evaluation Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Technical Knowledge", value: feedback.evaluationMetrics.technicalKnowledge },
              { label: "Problem Solving", value: feedback.evaluationMetrics.problemSolving },
              { label: "Communication", value: feedback.evaluationMetrics.communication },
              { label: "Project Experience", value: feedback.evaluationMetrics.projectExperience },
            ].map((metric, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-gray-700 font-semibold mb-2">{metric.label}</p>
                <div className="w-full bg-gray-300 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(metric.value / 10) * 100}%` }}
                  ></div>
                </div>
                <p className="text-gray-600 text-sm mt-1">{metric.value}/10</p>
              </div>
            ))}
          </div>
          {feedback.evaluationMetrics.overallReadiness && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-gray-700 font-semibold mb-2">Overall Readiness</p>
              <div className="w-full bg-gray-300 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full"
                  style={{ width: `${feedback.evaluationMetrics.overallReadiness * 10}%` }}
                ></div>
              </div>
              <p className="text-gray-600 text-sm mt-1">
                {(feedback.evaluationMetrics.overallReadiness * 100).toFixed(1)}%
              </p>
            </div>
          )}
        </div>
      )}

      {/* Strengths */}
      {feedback.strengths && feedback.strengths.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Strengths</h2>
          <div className="space-y-2">
            {feedback.strengths.map((strength, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <span className="text-green-600 font-bold text-lg mt-1">✓</span>
                <p className="text-gray-800">{strength}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weaknesses */}
      {feedback.weaknesses && feedback.weaknesses.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Areas of Concern</h2>
          <div className="space-y-2">
            {feedback.weaknesses.map((weakness, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <span className="text-red-600 font-bold text-lg mt-1">!</span>
                <p className="text-gray-800">{weakness}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Communication */}
      {feedback.communication && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Communication Assessment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { label: "Clarity", value: feedback.communication.clarity },
              { label: "Structure", value: feedback.communication.structure },
              { label: "Conciseness", value: feedback.communication.conciseness },
              { label: "Impact Focus", value: feedback.communication.impactFocus },
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-gray-700 font-semibold mb-2">{item.label}</p>
                <p className="text-gray-800">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Areas for Improvement */}
      {feedback.areasForImprovement && feedback.areasForImprovement.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Areas for Improvement</h2>
          <div className="space-y-2">
            {feedback.areasForImprovement.map((area, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <span className="text-yellow-600 font-bold text-lg mt-1">→</span>
                <p className="text-gray-800">{area}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {feedback.recommendations && feedback.recommendations.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Recommendations</h2>
          <div className="space-y-2">
            {feedback.recommendations.map((rec, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-blue-600 font-bold text-lg mt-1">💡</span>
                <p className="text-gray-800">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interviewer Notes */}
      {feedback.interviewerNotes && feedback.interviewerNotes.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Interviewer Notes</h2>
          <div className="space-y-3">
            {feedback.interviewerNotes.map((note, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg border border-gray-300">
                <p className="text-gray-700 font-semibold mb-2">{note.section}</p>
                <p className="text-gray-800">{note.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <p className="text-gray-600 text-sm text-center">
          Thank you for participating in the interview. Good luck with your next steps!
        </p>
      </div>
    </div>
  )
}
