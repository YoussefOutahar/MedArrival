import React, { useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import useAuth from '@/hooks/use-auth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authStorage } from '@/services/LocalStorage/AuthStorage';
import { DEFAULT_REDIRECTS } from '@/AuthGuard';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectUrl = searchParams.get("redirect");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      try {
        await signIn(email, password);

        if (redirectUrl) {
          navigate(redirectUrl);
        } else {
          const role = authStorage.getRole();
          navigate(DEFAULT_REDIRECTS[role as keyof typeof DEFAULT_REDIRECTS] || "/");
        }
      } catch (error) {
        // Error handling is managed by useAuth hook
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img
            src="/app-logo.svg"
            alt="CNESTEN Logo"
            className="h-16 w-auto"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          CNESTEN
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Centre National de l'Energie des Sciences et des Techniques Nucléaires
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 
                          text-red-700 dark:text-red-400 rounded">
              {error.message}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 
                           border border-gray-300 dark:border-gray-600 
                           rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500
                           bg-white dark:bg-gray-700 
                           text-gray-900 dark:text-white
                           focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 
                           focus:border-green-500 dark:focus:border-green-400"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full pl-10 pr-3 py-2 
                           border border-gray-300 dark:border-gray-600 
                           rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500
                           bg-white dark:bg-gray-700 
                           text-gray-900 dark:text-white
                           focus:outline-none focus:ring-green-500 dark:focus:ring-green-400 
                           focus:border-green-500 dark:focus:border-green-400"
                  placeholder="Enter your password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 
                         border border-transparent rounded-md shadow-sm 
                         text-sm font-medium text-white 
                         bg-green-600 hover:bg-green-700 
                         dark:bg-green-600 dark:hover:bg-green-700
                         focus:outline-none focus:ring-2 focus:ring-offset-2 
                         focus:ring-green-500 dark:focus:ring-green-400
                         disabled:bg-green-400 dark:disabled:bg-green-400 
                         disabled:cursor-not-allowed
                         transition-colors duration-200"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>

          {/* Optional: Add a forgot password link */}
          <div className="mt-6">
            <div className="text-center">
              <a
                href="/auth/forgot-password"
                className="text-sm text-green-600 hover:text-green-500 
                         dark:text-green-400 dark:hover:text-green-300"
              >
                Forgot your password?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;