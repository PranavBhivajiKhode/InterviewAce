import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import your layout and pages
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/Auth';
import DashboardLiveInterview from './LiveInterview/DashboardLiveInterview';
import ResumeAnalyzer from './pages/ResumeAnalyzer'; 
import AiInterview from './AiInterview/AiInterview';
import AiInterviewVideoPage from './/AiInterview/AiInterviewVideoPage';  // ✅ corrected path
import ReportDetails from './AiInterview/ReportDetails';
import LiveInterview from './LiveInterview/LiveInterview';
import InterviewScheduler from './LiveInterview/InterviewScheduler';

// A simple component to simulate a protected route
// TODO: Replace with real auth logic
const PrivateRoute = ({ children }) => {
  const isAuthenticated = true; // TODO: Get this from your auth state
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* --- Public Auth Route --- */}
        <Route path="/auth" element={<AuthPage />} />

        {/* --- Private Routes (all nested inside the Layout) --- */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          {/* Dashboard is the main page */}
          <Route index element={<Dashboard />} /> 
          
          {/* AI Interview Routes */}
          <Route path="ai-interview" element={<AiInterview />} />
          <Route path="ai-interview-video" element={<AiInterviewVideoPage />} />
          <Route path="report" element={<ReportDetails />} />
          
          {/* Live Interview Routes */}
          <Route path="live-interview" element={<DashboardLiveInterview />} />
          <Route path="live-interview/:roomId" element={<LiveInterview />} />
          
          {/* Resume Analyzer */}
          <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
          
          {/* TODO: Create these pages */}
          {/* <Route path="schedule" element={<SchedulePage />} /> */}
          {/* <Route path="report/:id" element={<ReportDetailsById />} /> */}
          <Route path="schedule-interview" element={<InterviewScheduler />} />
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;