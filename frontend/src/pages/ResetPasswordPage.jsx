import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as authService from '../services/authService';
import { Wallet, Lock, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const mismatch = confirmPassword.length > 0 && password !== confirmPassword;
  const tooShort = password.length > 0 && password.length < 6;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mismatch || tooShort) return;
    setSubmitting(true);
    setError('');
    try {
      await authService.resetPassword(token, { password });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
            <h2 className="mt-4 text-3xl font-bold text-surface-900">Password reset</h2>
            <p className="mt-2 text-sm text-surface-600">
              Your password has been changed successfully.
            </p>
          </div>
          <div className="bg-white rounded-xl border border-surface-200 p-8 shadow-sm">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full bg-primary-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-primary-700 transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              Go to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Wallet className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-4 text-3xl font-bold text-surface-900">Choose a new password</h2>
          <p className="mt-2 text-sm text-surface-600">
            Pick a strong password of at least 6 characters.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-surface-200 p-8 shadow-sm space-y-6"
          aria-label="Reset password form"
        >
          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-surface-700 mb-1">
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-surface-400" aria-hidden="true" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-surface-200 pl-10 pr-10 py-2.5 text-surface-900 placeholder:text-surface-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-2.5 text-surface-400 hover:text-surface-600"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {tooShort && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" aria-hidden="true" /> At least 6 characters required.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-surface-700 mb-1">
              Confirm new password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-surface-400" aria-hidden="true" />
              <input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full rounded-lg border pl-10 pr-3 py-2.5 text-surface-900 placeholder:text-surface-400 focus:ring-2 outline-none transition-colors ${
                  mismatch
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-surface-200 focus:border-primary-500 focus:ring-primary-200'
                }`}
                placeholder="••••••••"
              />
            </div>
            {mismatch && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" aria-hidden="true" /> Passwords do not match.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting || mismatch || tooShort}
            className="w-full bg-primary-600 text-white font-medium py-2.5 px-4 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
          >
            {submitting ? 'Resetting...' : 'Reset password'}
          </button>

          <p className="text-sm text-center">
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Back to sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
