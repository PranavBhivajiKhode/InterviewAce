import React from 'react';
import { Link } from 'react-router-dom';
import { Bot, FileText, Video, Calendar, ClipboardList } from 'lucide-react';

// This is the main hub you requested, with all features "one click away".
export default function Dashboard() {
  
  // TODO: Fetch this data from your API
  const pastInterviews = [
    { id: 1, role: 'Software Engineer', date: '2025-10-26', score: 82 },
    { id: 2, role: 'Data Analyst', date: '2025-10-24', score: 75 },
    { id: 3, role: 'Frontend Developer', date: '2025-10-22', score: 91 },
  ];

  return (
    <div className="space-y-12 animate-fade-in">
      {/* --- WELCOME HEADER --- */}
      <div className="p-8 bg-gradient-to-r from-primary to-indigo-600 rounded-xl shadow-2xl">
        <h1 className="text-4xl font-bold text-white">Welcome, Candidate!</h1>
        <p className="text-lg text-indigo-100 mt-2">
          You're one step closer to your dream job. Let's get started.
        </p>
      </div>

      {/* --- CORE FEATURES GRID --- */}
      <div>
        <h2 className="text-3xl font-semibold mb-6 text-text-main">
          Your Toolkit
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* AI Video Interview Card - UPDATED TO REDIRECT TO VIDEO PAGE */}
          <FeatureCard
            to="/ai-interview"
            icon={<Bot size={32} className="text-primary" />}
            title="AI Mock Interview"
            description="Record yourself and get AI-powered feedback on your performance."
          />

          <FeatureCard
            to="/ai-interview-video"
            icon={<Bot size={32} className="text-primary" />}
            title="AI Mock Interview Video"
            description="Record yourself and get AI-powered feedback on your performance."
          />

          {/* Resume Analyzer Card */}
          <FeatureCard
            to="/resume-analyzer"
            icon={<FileText size={32} className="text-secondary" />}
            title="Resume Analyzer"
            description="Get an ATS score and analysis for your resume against a job role."
          />

          {/* Live Interview Card */}
          <FeatureCard
            to="/live-interview"
            icon={<Video size={32} className="text-rose-500" />}
            title="Live Interview Room"
            description="Join or host a live online interview with a human interviewer."
          />
          
          {/* Interview Scheduling Card */}
          <FeatureCard
            to="/schedule-interview"
            icon={<Calendar size={32} className="text-amber-500" />}
            title="Schedule Interview"
            description="Manage your bookings and schedule new live interviews."
          />

        </div>
      </div>

      {/* --- PAST INTERVIEW REPORTS --- */}
      <div>
        <h2 className="text-3xl font-semibold mb-6 text-text-main">
          Past Interview Reports
        </h2>
        <div className="bg-surface rounded-xl shadow-lg overflow-hidden border border-slate-700">
          <ul className="divide-y divide-slate-700">
            {pastInterviews.length > 0 ? (
              pastInterviews.map((interview) => (
                <li key={interview.id} className="p-6 flex justify-between items-center hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <ClipboardList className="text-primary/70" size={24} />
                    <div>
                      <h3 className="text-lg font-semibold text-text-main">{interview.role}</h3>
                      <p className="text-sm text-text-muted">Completed on: {interview.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-secondary">{interview.score}%</span>
                    <Link 
                      to={`/report/${interview.id}`}
                      className="btn-secondary"
                    >
                      View Report
                    </Link>
                  </div>
                </li>
              ))
            ) : (
              <p className="p-6 text-text-muted">You have no completed interviews yet.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

// Reusable card component for the dashboard
const FeatureCard = ({ to, icon, title, description }) => (
  <Link to={to} className="dashboard-card group">
    <div className="mb-4 p-3 bg-background rounded-full w-fit shadow-inner">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-text-main mb-2 group-hover:text-primary transition-colors">
      {title}
    </h3>
    <p className="text-text-muted">
      {description}
    </p>
    <div className="mt-4 text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
      Start Now &rarr;
    </div>
  </Link>
);