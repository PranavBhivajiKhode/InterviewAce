import React, { useState } from 'react';
import { Bot, Mic, Video, Send, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AiInterviewPage() {
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(
    "Welcome! Let's start with an easy one: Tell me about yourself."
  );
  
  // TODO: Add logic to get a new question from Gemini API [cite: 21, 35]
  const handleNextQuestion = () => {
    setCurrentQuestion("Great. Now, can you describe a challenging project you worked on?");
  };

  // TODO: Add logic to handle speech-to-text [cite: 37]
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Start/Stop speech recognition
  };

  // TODO: Add logic to end interview and navigate to report page [cite: 23, 41]
  const handleEndInterview = () => {
    if (window.confirm("Are you sure you want to end the interview?")) {
      navigate('/report/new-report-id'); // Navigate to the new report
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
      {/* --- Left Column: Video & Controls --- */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-surface rounded-xl shadow-2xl aspect-video w-full flex items-center justify-center">
          {/* TODO: Integrate webcam feed here */}
          <Video size={64} className="text-text-muted" />
          <p className="absolute text-lg text-text-muted">Webcam Feed</p>
        </div>
        
        <div className="flex justify-center items-center gap-6 p-4 bg-surface rounded-xl">
          <button 
            className={`p-4 rounded-full transition-all ${
              isRecording 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-primary hover:bg-primary-hover'
            }`}
            onClick={toggleRecording}
          >
            <Mic size={24} className="text-white" />
          </button>
          
          <button 
            className="btn-secondary !bg-red-800/80 !border-red-700 !text-white hover:!bg-red-700"
            onClick={handleEndInterview}
          >
            <XCircle size={20} />
            End Interview
          </button>

          <button 
            className="btn-secondary"
            onClick={handleNextQuestion}
          >
            <Send size={20} />
            Next Question
          </button>
        </div>
      </div>

      {/* --- Right Column: AI & Transcript --- */}
      <div className="bg-surface rounded-xl shadow-lg p-6 space-y-6 h-fit lg:h-full flex flex-col">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/20 rounded-full">
            <Bot size={24} className="text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-text-main">AI Interviewer</h2>
        </div>
        
        {/* AI Question Box */}
        <div className="bg-background p-6 rounded-lg border border-slate-700 min-h-[150px]">
          <p className="text-lg text-text-main leading-relaxed">
            {currentQuestion}
          </p>
        </div>
        
        {/* Transcript Box */}
        <div className="flex-grow space-y-3">
          <h3 className="text-xl font-semibold text-text-main">Your Answer (Transcript)</h3>
          <div className="bg-background p-4 rounded-lg border border-slate-700 h-full min-h-[200px] text-text-muted overflow-y-auto">
            {isRecording ? (
              <p className="italic">Listening...</p>
            ) : (
              <p>Your transcribed answer will appear here... [cite: 37]</p>
            )}
            {/* TODO: Populate this div with the speech-to-text output */}
          </div>
        </div>
      </div>
    </div>
  );
}