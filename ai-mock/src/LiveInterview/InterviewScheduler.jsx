import React, { useEffect, useState } from 'react';
import { Copy, Play, Trash2, Calendar, Clock } from 'lucide-react';

const STORAGE_KEY = 'mockInterview_scheduledInterviews';

export default function InterviewScheduler() {
  const [interviews, setInterviews] = useState([]);
  const [candidateName, setCandidateName] = useState('');
  const [position, setPosition] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('45');
  const [notes, setNotes] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setInterviews(JSON.parse(saved));
      } catch {
        setInterviews([]);
      }
    }
  }, []);

  const saveInterviews = (list) => {
    setInterviews(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const handleCreateInterview = (e) => {
    e.preventDefault();
    if (!candidateName || !date || !time) {
      alert('Please fill at least candidate name, date and time.');
      return;
    }

    const id = Date.now().toString();
    const randomId = Math.random().toString(36).substring(2, 7);
    const roomName = `Mock Interview ${candidateName} ${randomId}`;
    const jitsiUrl = `https://meet.jit.si/${encodeURIComponent(roomName)}`;
    const dateTime = `${date}T${time}`;

    const newInterview = {
      id,
      candidateName,
      position,
      date,
      time,
      dateTime,
      duration,
      notes,
      roomName,
      jitsiUrl,
      status: 'SCHEDULED',
    };

    const updated = [...interviews, newInterview].sort(
      (a, b) => new Date(a.dateTime) - new Date(b.dateTime)
    );
    saveInterviews(updated);

    // clear form
    setCandidateName('');
    setPosition('');
    setDate('');
    setTime('');
    setDuration('45');
    setNotes('');
  };

  const handleCopyLink = (id, url) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleJoinAsInterviewer = (url) => {
    window.open(url, '_blank'); // open full Jitsi room
  };

  const handleDeleteInterview = (id) => {
    const updated = interviews.filter((i) => i.id !== id);
    saveInterviews(updated);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-text-main">Schedule Live Interview</h1>

      {/* --- Create Interview Form --- */}
      <form
        onSubmit={handleCreateInterview}
        className="bg-surface rounded-2xl shadow-lg p-6 space-y-4"
      >
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-text-muted mb-1">
              Candidate Name *
            </label>
            <input
              type="text"
              value={candidateName}
              onChange={(e) => setCandidateName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background outline-none"
              placeholder="e.g. Rohan Sharma"
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">
              Position / Role
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background outline-none"
              placeholder="e.g. Frontend Developer"
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">
              Time *
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background outline-none"
            />
          </div>

          <div>
            <label className="block text-sm text-text-muted mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              min="15"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border bg-background outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm text-text-muted mb-1">
            Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border bg-background outline-none"
            placeholder="Anything specific to ask / evaluate..."
          />
        </div>

        <button
          type="submit"
          className="mt-2 px-6 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium"
        >
          Create Interview
        </button>
      </form>

      {/* --- Upcoming Interviews List --- */}
      <div className="bg-surface rounded-2xl shadow-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-text-main mb-2">
          Upcoming Interviews
        </h2>

        {interviews.length === 0 && (
          <p className="text-text-muted text-sm">
            No interviews scheduled yet. Create one using the form above.
          </p>
        )}

        <div className="space-y-3">
          {interviews.map((iv) => (
            <div
              key={iv.id}
              className="border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="font-semibold text-text-main">
                  {iv.candidateName}{' '}
                  {iv.position && (
                    <span className="text-xs text-text-muted">
                      • {iv.position}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} /> {iv.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={14} /> {iv.time} • {iv.duration} mins
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 break-all">
                  Jitsi Link: {iv.jitsiUrl}
                </div>
                {iv.notes && (
                  <div className="text-xs text-slate-300 mt-1">
                    Notes: {iv.notes}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-start md:self-auto">
                <button
                  onClick={() => handleJoinAsInterviewer(iv.jitsiUrl)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex items-center gap-1"
                >
                  <Play size={14} />
                  Join as Interviewer
                </button>

                <button
                  onClick={() => handleCopyLink(iv.id, iv.jitsiUrl)}
                  className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs flex items-center gap-1"
                >
                  <Copy size={14} />
                  {copiedId === iv.id ? 'Copied!' : 'Copy Link'}
                </button>

                <button
                  onClick={() => handleDeleteInterview(iv.id)}
                  className="p-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white"
                  title="Delete interview"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
