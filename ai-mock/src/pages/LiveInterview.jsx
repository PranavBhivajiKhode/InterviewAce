import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PhoneOff } from 'lucide-react';

export default function LiveInterview() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    // Jitsi script loaded from index.html → available as window.JitsiMeetExternalAPI
    const domain = 'meet.jit.si';
    const options = {
      roomName: roomId || 'default-mock-interview-room',
      parentNode: jitsiContainerRef.current,
      configOverwrite: {
        prejoinPageEnabled: true,
      },
      interfaceConfigOverwrite: {
        TILE_VIEW_MAX_COLUMNS: 2,
      },
      userInfo: {
        displayName: 'Candidate',
      },
    };

    // Create Jitsi meeting
    apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

    // Optional: listen for end call events
    apiRef.current.addListener('readyToClose', () => {
      navigate('/');
    });

    // Cleanup on unmount
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, [roomId, navigate]);

  const handleEndCall = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
    }
    navigate('/');
  };

  return (
    <div className="animate-fade-in space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-text-main">
          Live Interview Room – {roomId}
        </h1>
        <button
          onClick={handleEndCall}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 hover:bg-red-700 text-white text-sm"
        >
          <PhoneOff size={18} />
          End Interview
        </button>
      </div>

      <div
        ref={jitsiContainerRef}
        className="w-full flex-1 bg-black rounded-2xl overflow-hidden"
      />
    </div>
  );
}
