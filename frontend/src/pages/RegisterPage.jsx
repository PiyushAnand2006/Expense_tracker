import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Wallet, User, Mail, Lock } from 'lucide-react';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, error, clearError } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const username = e.target.username.value;
    const email = e.target.email.value;
    const password = e.target.password.value;
    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch {
      // Error is handled in context
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Wallet className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-4 text-3xl font-bold text-surface-900">Create account</h2>
          <p className="mt-2 text-sm text-surface-600">Start tracking your expenses today.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-surface-200 p-8 shadow-sm space-y-5" aria-label="Register form">
          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-surface-700 mb-1">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-surface-400" aria-hidden="true" />
              <input
                id="username"
                type="text"
                required
                minLength={3}
                maxLength={30}
                onChange={clearError}
                className="w-full rounded-lg border border-surface-200 pl-10 pr-3 py-2.5 text-surface-900 placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
                placeholder="johndoe"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-surface-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-surface-400" aria-hidden="true" />
              <input
                id="email"
                type="email"
                required
                onChange={clearError}
                className="w-full rounded-lg border border-surface-200 pl-10 pr-3 py-2.5 text-surface-900 placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-surface-400" aria-hidden="true" />
              <input
                id="password"
                type="password"
                required
                minLength={6}
                onChange={clearError}
                className="w-full rounded-lg border border-surface-200 pl-10 pr-3 py-2.5 text-surface-900 placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            {submitting ? 'Creating Account...' : 'Create Account'}
          </button>

          <p className="text-sm text-center text-surface-600">
            Already have an account? <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
