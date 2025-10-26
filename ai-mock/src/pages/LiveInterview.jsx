import React, { useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LiveInterviewPage() {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // TODO: Integrate Video Conferencing SDK/API [cite: 45, 75]
  
  const handleEndCall = () => {
    // TODO: Add logic to disconnect from the video call
    navigate('/'); // Go back to dashboard
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-text-main">Live Interview Room</h1>
        <div className="flex items-center gap-2 p-2 bg-surface rounded-lg text-text-muted">
          <Users size={20} />
          <span>2 Participants</span>
        </div>
      </div>

      {/* --- Video Feeds --- */}
      <div className="relative w-full aspect-video bg-surface rounded-2xl shadow-2xl flex items-center justify-center">
        {/* --- Interviewer's Video (Main) --- */}
        {/* TODO: Replace with actual video element */}
        <div className="w-full h-full flex flex-col items-center justify-center">
          <VideoOff size={64} className="text-text-muted" />
          <p className="text-xl text-text-muted mt-4">Interviewer's Video</p>
        </div>

        {/* --- Candidate's Video (Self-view) --- */}
        {/* TODO: Replace with actual self-view video element */}
        <div className="absolute bottom-6 right-6 w-1/4 max-w-[250px] aspect-video bg-background rounded-lg shadow-lg border-2 border-primary">
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
            {isVideoOff ? (
              <VideoOff size={32} className="text-text-muted" />
            ) : (
              <Video size={32} className="text-text-muted" />
            )}
            <p className="text-sm text-text-muted mt-2">Your Video</p>
          </div>
        </div>
      </div>

      {/* --- Control Bar --- */}
      <div className="bg-surface rounded-xl shadow-lg p-6 flex justify-center items-center gap-6">
        <button
          className={`p-4 rounded-full transition-all ${
            isMuted ? 'bg-slate-600' : 'bg-primary hover:bg-primary-hover'
          }`}
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff size={24} className="text-white" /> : <Mic size={24} className="text-white" />}
        </button>

        <button
          className={`p-4 rounded-full transition-all ${
            isVideoOff ? 'bg-slate-600' : 'bg-primary hover:bg-primary-hover'
          }`}
          onClick={() => setIsVideoOff(!isVideoOff)}
          title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
        >
          {isVideoOff ? <VideoOff size={24} className="text-white" /> : <Video size={24} className="text-white" />}
        </button>

        <button
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 transition-all"
          onClick={handleEndCall}
          title="End Call"
        >
          <PhoneOff size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
}