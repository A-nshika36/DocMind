import React, { useState } from 'react';
import { BookOpen, Mail, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { loginUser } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';

interface LoginPageProps {
  onNavigate: (page: string) => void;
  successMessage?: string | null;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, successMessage }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await loginUser({
        email: email.trim(),
        password,
      });

      // Update auth context state and persist token
      login(response.token, response.user);

      // Redirect authenticated user to Dashboard
      onNavigate('dashboard');
    } catch (err: any) {
      setErrorMessage(err.message || 'Incorrect email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-[#FBFBFA]">
      <div className="w-full max-w-md bg-white rounded-3xl border border-[#E2E8F0] p-8 shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0D7466] to-[#14B8A6] flex items-center justify-center text-white mx-auto mb-3 shadow-xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#1E2929]">Welcome Back</h1>
          <p className="text-sm text-[#718096] mt-1">
            Log in to continue learning with DocMind
          </p>
        </div>

        {/* Success message banner from registration redirect */}
        {successMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1E2929] uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A0AEC0] absolute left-3.5 top-3.5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#0D7466] focus:ring-2 focus:ring-[#0D7466]/20 text-sm outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E2929] uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A0AEC0] absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#0D7466] focus:ring-2 focus:ring-[#0D7466]/20 text-sm outline-none transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-[#0D7466] hover:bg-[#0A5C51] text-white font-bold text-sm shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <span>{isLoading ? 'Logging In...' : 'Login'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-[#E2E8F0] text-center text-sm text-[#718096]">
          Don't have an account?{' '}
          <button
            onClick={() => onNavigate('register')}
            className="font-bold text-[#0D7466] hover:underline"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
};
