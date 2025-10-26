import React, { useState } from 'react';
import { Mail, Lock, User, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Add your authentication logic here
    // 1. Get data from e.target.email.value, e.target.password.value
    // 2. Call your Spring Boot API [cite: 30, 65]
    // 3. On success: navigate('/');
    // 4. On error: show an error message
    console.log(`Submitting ${isLogin ? 'Login' : 'Register'} form...`);
    
    // Simulate successful login
    navigate('/'); 
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] animate-fade-in">
      <div className="w-full max-w-md p-8 space-y-6 bg-surface rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center space-y-2">
          <Zap className="text-primary" size={48} />
          <h1 className="text-3xl font-bold text-center text-text-main">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h1>
          <p className="text-text-muted">
            {isLogin ? 'Log in to access your dashboard.' : 'Sign up to start your AI interview prep.'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="input-field pl-10"
                placeholder="Full Name"
              />
            </div>
          )}
          
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input-field pl-10"
              placeholder="Email address"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="input-field pl-10"
              placeholder="Password"
            />
          </div>

          <button type="submit" className="btn-primary w-full !py-3">
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-center text-text-muted">
          {isLogin ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="font-medium text-primary hover:underline ml-2"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
}