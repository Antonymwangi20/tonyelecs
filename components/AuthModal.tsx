
import React, { useState } from 'react';
import { X, Mail, Lock, User as UserIcon, Chrome, Loader } from 'lucide-react';
import { signIn, signUp, signInWithGoogle } from '../services/authService';
import { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: User) => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Sign in
        const result = await signIn(email, password);
        if (!result.success) {
          setError(result.error || 'Login failed');
          setLoading(false);
          return;
        }
      } else {
        // Sign up
        if (!name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        const result = await signUp(email, password, name);
        if (!result.success) {
          setError(result.error || 'Signup failed');
          setLoading(false);
          return;
        }
      }

      // Create user object for app state
      const mockUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email: email,
        name: name || email.split('@')[0],
        role: 'customer', // Default role
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      };
      
      onLogin(mockUser);
      onClose();
      setEmail('');
      setPassword('');
      setName('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithGoogle();
      if (!result.success) {
        setError(result.error || 'Google sign-in failed. Make sure Google OAuth is configured in Supabase.');
        setLoading(false);
        return;
      }
      // Google OAuth will redirect to the callback URL
      // No need to close modal or clear form - page will redirect
    } catch (err: any) {
      setError(err.message || 'An error occurred during Google sign-in');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-8 sm:p-12">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">
              {isLogin ? 'Welcome Back' : 'Join VoltVibe'}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-2xl transition-colors">
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>

          <div className="space-y-4 mb-8">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3.5 rounded-2xl font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Chrome className="w-5 h-5 text-blue-500" />
              Continue with Google
            </button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t dark:border-gray-800"></span></div>
              <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-gray-900 px-4 text-gray-500">Or continue with email</span></div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Full Name"
                  required
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all disabled:opacity-50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                required
                disabled={loading}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all disabled:opacity-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                required
                disabled={loading}
                minLength={6}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 dark:text-white transition-all disabled:opacity-50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-200 dark:shadow-none active:scale-[0.98] mt-4 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
            <button 
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              disabled={loading}
              className="text-blue-600 dark:text-blue-400 font-bold hover:underline disabled:opacity-50"
            >
              {isLogin ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
