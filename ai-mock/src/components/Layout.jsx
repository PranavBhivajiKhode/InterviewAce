import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Zap, LogOut, User } from 'lucide-react';

// --- HEADER ---
const Header = () => {
  const navigate = useNavigate();
  // TODO: Replace with actual auth state
  const isAuthenticated = true; 

  const handleLogout = () => {
    // TODO: Add your logout logic here
    console.log("User logged out");
    navigate('/auth');
  };

  return (
    <header className="bg-surface/80 backdrop-blur-md sticky top-0 z-50 w-full shadow-lg border-b border-slate-700/50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 animate-fade-in">
          <Zap className="text-primary animate-pulse-slow" size={28} />
          <span className="text-2xl font-bold text-text-main">
            Interview Ace
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-text-muted hidden sm:block">Welcome, Candidate!</span>
              <button 
                onClick={handleLogout} 
                className="btn-secondary !py-2 !px-3"
                title="Logout"
              >
                <LogOut size={18} />
                <span className="hidden sm:block">Logout</span>
              </button>
            </>
          ) : (
            <Link to="/auth" className="btn-primary">
              <User size={18} />
              Login / Register
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
};

// --- FOOTER ---
const Footer = () => {
  // TODO: Update with your project team names [cite: 9]
  const teamNames = "Hassan, Nikunj, Piyush, Pranav, & Pranup";

  return (
    <footer className="bg-surface w-full mt-auto border-t border-slate-700/50">
      <div className="container mx-auto px-6 py-8 text-center text-text-muted">
        <p>
          &copy; {new Date().getFullYear()} Interview Ace. 
          A Final Year Project by {teamNames}.
        </p>
        <p className="text-sm mt-1">
          Built with React, Spring Boot, Python, and Gemini AI [cite: 60, 65, 69, 70]
        </p>
      </div>
    </footer>
  );
};

// --- LAYOUT (Combines Header, Page Content, and Footer) ---
export default function Layout() {
  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-6 py-12">
        {/* Outlet renders the active page (Dashboard, AiInterview, etc.) */}
        <Outlet />
      </main>
      <Footer />
    </>
  );
}