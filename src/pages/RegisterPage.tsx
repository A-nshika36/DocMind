import React, { useState } from 'react';
import { BookOpen, User, Mail, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { registerUser } from '../services/api.js';

interface RegisterPageProps {
  onNavigate: (page: string, state?: { successMessage?: string }) => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Client-side validations
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('All fields are required.');
      return;
    }

    if (name.trim().length < 2) {
      setErrorMessage('Full Name must be at least 2 characters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await registerUser({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });

      // Redirect user to Login page with success message
      onNavigate('login', {
        successMessage: response.message || 'Account created successfully. Please login to continue.',
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
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
          <h1 className="text-2xl font-bold text-[#1E2929]">Create an Account</h1>
          <p className="text-sm text-[#718096] mt-1">
            Join DocMind to start learning from your documents
          </p>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
            {errorMessage}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1E2929] uppercase tracking-wider mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#A0AEC0] absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#0D7466] focus:ring-2 focus:ring-[#0D7466]/20 text-sm outline-none transition-all"
                required
              />
            </div>
          </div>

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
                placeholder="At least 6 characters"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] focus:border-[#0D7466] focus:ring-2 focus:ring-[#0D7466]/20 text-sm outline-none transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1E2929] uppercase tracking-wider mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A0AEC0] absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
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
            <span>{isLoading ? 'Creating Account...' : 'Register'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-5 border-t border-[#E2E8F0] text-center text-sm text-[#718096]">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="font-bold text-[#0D7466] hover:underline"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};
