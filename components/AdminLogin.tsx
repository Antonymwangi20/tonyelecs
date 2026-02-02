import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, Loader, ArrowRight } from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';

const AdminLogin: React.FC = () => {
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = location?.state?.from || '/admin';

  if (isAuthenticated) {
    navigate(from, { replace: true });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.success) {
      setError(res.error || 'Login failed');
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 dark:text-white">Admin Login</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">
                Private dashboard access
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400 font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                placeholder="Admin email"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all disabled:opacity-50"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="Password"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black py-4 rounded-2xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              {loading ? <Loader className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-gray-500 dark:text-gray-400 font-bold">
            Customers login on the main site. This area is for admins/managers only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;


