import React, { useState } from 'react';
import { Copy, Link2, Play } from 'lucide-react';

export default function DashboardLiveInterview() {
  const [roomName, setRoomName] = useState('');
  const [copied, setCopied] = useState(false);

  const generateRoomName = () => {
    const randomId = Math.random().toString(36).substring(2, 8);
    const name = `Mock Interview ${randomId}`;
    setRoomName(name);
  };

  const jitsiUrl = roomName
    ? `https://meet.jit.si/${encodeURIComponent(roomName)}`
    : '';

  const handleCopyLink = () => {
    if (!jitsiUrl) return;
    navigator.clipboard.writeText(jitsiUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartInterview = () => {
    if (!jitsiUrl) return;
    window.open(jitsiUrl, '_blank'); // open full Jitsi in new tab
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-main">Live Interview</h1>

      <div className="bg-surface rounded-2xl shadow-lg p-6 space-y-4">
        <p className="text-text-muted">
          Generate a unique Jitsi room and share the link with the candidate.
          Both of you should open the same link.
        </p>

        <div className="flex flex-col md:flex-row gap-3 items-center">
          <input
            type="text"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Enter or generate room name"
            className="flex-1 px-3 py-2 rounded-lg border bg-background outline-none"
          />
          <button
            onClick={generateRoomName}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-hover text-white text-sm flex items-center gap-2"
          >
            <Link2 size={16} />
            Generate
          </button>
        </div>

        {roomName && (
          <div className="space-y-2 text-sm text-text-muted">
            <div>Share this interview link with the candidate:</div>
            <div className="font-mono text-xs break-all">
              {jitsiUrl}
            </div>
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-white text-xs"
            >
              <Copy size={14} />
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        )}

        <button
          onClick={handleStartInterview}
          disabled={!roomName}
          className="mt-4 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-500 text-white font-medium flex items-center gap-2"
        >
          <Play size={18} />
          Start Interview (open Jitsi)
        </button>
      </div>
    </div>
  );
}
