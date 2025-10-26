import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import your layout and pages
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AuthPage from './pages/Auth';
import AiInterviewPage from './pages/AiInterview';
import LiveInterviewPage from './pages/LiveInterview';


import ResumeAnalyzer from './pages/ResumeAnalyzer'; 

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
          
          {/* Your other pages */}
          <Route path="ai-interview" element={<AiInterviewPage />} />
          <Route path="live-interview" element={<LiveInterviewPage />} />
          <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
          
          {/* TODO: Create these pages */}
          {/* <Route path="schedule" element={<div>Schedule Page</div>} /> */}
          {/* <Route path="/report/:id" element={<div>Report Details Page</div>} /> */}
        </Route>
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;