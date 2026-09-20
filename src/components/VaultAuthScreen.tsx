import React, { useState } from 'react';
import { UserProfile, UserVaultData } from '../types';
import {
  loginUser,
  registerUser,
  getPublicUserProfiles,
} from '../services/authService';
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  ArrowRight,
  Scale,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Users,
  CheckCircle2,
} from 'lucide-react';

interface VaultAuthScreenProps {
  onAuthenticated: (user: UserProfile, vault: UserVaultData) => void;
  theme?: 'dark' | 'light';
  currentActiveLoginId?: string;
}

export const VaultAuthScreen: React.FC<VaultAuthScreenProps> = ({
  onAuthenticated,
  theme = 'light',
  currentActiveLoginId,
}) => {
  const isDark = theme === 'dark';
  const [mode, setMode] = useState<'signin' | 'register'>('signin');

  // Sign In Form State
  const [loginId, setLoginId] = useState(currentActiveLoginId || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration Form State
  const [regLoginId, setRegLoginId] = useState('');
  const [regName, setRegName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regAvatarColor, setRegAvatarColor] = useState('#2563eb');
  const [regSeedTemplate, setRegSeedTemplate] = useState(true);

  // Status & Error handling
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Available profiles on device
  const existingProfiles = getPublicUserProfiles();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginId.trim()) {
      setError('Please enter your Login ID.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const result = await loginUser(loginId.trim(), password);
      onAuthenticated(result.user, result.vault);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const result = await registerUser(
        regLoginId,
        regName,
        regPassword,
        regAvatarColor,
        regSeedTemplate
      );
      onAuthenticated(result.user, result.vault);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const selectAccount = (selectedId: string) => {
    setLoginId(selectedId);
    setPassword('');
    setError(null);
  };

  const AVATAR_COLORS = [
    '#1d4ed8', // blue / corporate navy
    '#059669', // emerald
    '#4f46e5', // indigo
    '#7c3aed', // violet
    '#e11d48', // rose
    '#d97706', // amber
    '#0d9488', // teal
    '#334155', // slate
  ];

  return (
    <div
      className={`min-h-screen flex flex-col justify-center items-center px-4 py-8 sm:py-12 transition-colors ${
        isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50/70 text-slate-900'
      }`}
    >
      <div className="w-full max-w-md">
        {/* Top Branding Card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-2.5 mb-3">
            <div className="w-11 h-11 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-lg shadow-blue-700/25">
              <Scale size={24} strokeWidth={2.2} />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight font-sans text-slate-900 dark:text-white">
                  Balance Ledger
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Institutional Financial Vault
              </p>
            </div>
          </div>

          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {mode === 'signin' ? 'Sign In to Your Vault' : 'Register New Account'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            {mode === 'signin'
              ? 'Enter your Login ID and password to access your isolated books, liabilities, and budgets.'
              : 'Each user is assigned a strictly isolated, encrypted personal vault with zero cross-user access.'}
          </p>
        </div>

        {/* Auth Mode Toggle Tabs */}
        <div className="flex p-1 mb-5 rounded-xl bg-slate-200/80 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            id="tab-signin-btn"
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Sign In with Login ID
          </button>
          <button
            id="tab-register-btn"
            type="button"
            onClick={() => {
              setMode('register');
              setError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Register New Account
          </button>
        </div>

        {/* Main Form Container */}
        <div
          className={`rounded-2xl border p-6 sm:p-7 shadow-xl transition-all ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 backdrop-blur-md'
              : 'bg-white border-slate-200/90 shadow-slate-200/50'
          }`}
        >
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Quick Profile Selection for Profiles on this Device */}
              {existingProfiles.length > 0 && (
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                    <Users size={12} />
                    <span>Select Profile on This Device</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {existingProfiles.map((p) => {
                      const isSelected = loginId.toLowerCase() === p.loginId.toLowerCase();
                      return (
                        <button
                          key={p.loginId}
                          type="button"
                          onClick={() => selectAccount(p.loginId)}
                          className={`p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 dark:border-blue-500 ring-2 ring-blue-500/20'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div
                            className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm"
                            style={{ backgroundColor: p.avatarColor || '#1d4ed8' }}
                          >
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold block truncate text-slate-800 dark:text-slate-200">
                              {p.name}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400 block truncate">
                              @{p.loginId}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Login ID Input */}
              <div>
                <label
                  htmlFor="auth-login-id"
                  className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5"
                >
                  Login ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    id="auth-login-id"
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="e.g. admin or username"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-slate-100 focus:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600 focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="auth-password"
                    className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                  >
                    Password / PIN
                  </label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={16} />
                  </div>
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password or PIN"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-slate-100 focus:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600 focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="auth-signin-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-600 active:scale-[0.99] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-700/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Lock size={15} />
                <span>{loading ? 'Authenticating Vault...' : 'Unlock Private Vault'}</span>
                <ArrowRight size={15} />
              </button>

              {/* Master Credential Autofill Shortcut */}
              <div
                className={`pt-3 border-t dark:border-slate-800 text-center flex items-center justify-between text-[11px] ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <span>Master Admin: <strong className="font-mono text-slate-700 dark:text-slate-300">admin</strong> / <strong className="font-mono text-slate-700 dark:text-slate-300">admin123</strong></span>
                <button
                  type="button"
                  onClick={() => selectAccount('admin')}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                >
                  Fill Master
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Desired Unique Login ID */}
              <div>
                <label
                  htmlFor="reg-login-id"
                  className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5"
                >
                  Unique Login ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <span className="font-mono text-xs font-bold">@</span>
                  </div>
                  <input
                    id="reg-login-id"
                    type="text"
                    required
                    value={regLoginId}
                    onChange={(e) => setRegLoginId(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                    placeholder="e.g. john_doe or analyst_01"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl text-xs font-mono border transition-all ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-slate-100 focus:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600 focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Alphanumeric characters, underscores, and dashes. This will be your permanent vault key.
                </p>
              </div>

              {/* Full Display Name */}
              <div>
                <label
                  htmlFor="reg-display-name"
                  className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5"
                >
                  Full / Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    id="reg-display-name"
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-slate-100 focus:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600 focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                </div>
              </div>

              {/* Password / PIN Input */}
              <div>
                <label
                  htmlFor="reg-password"
                  className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5"
                >
                  Set Private Password / PIN
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound size={16} />
                  </div>
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimum 4 characters"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                      isDark
                        ? 'bg-slate-950/80 border-slate-700 text-slate-100 focus:border-blue-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-600 focus:bg-white'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Avatar Accent Color */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-2">
                  Account Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_COLORS.map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => setRegAvatarColor(col)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        regAvatarColor === col
                          ? 'ring-2 ring-offset-2 ring-blue-600 scale-110'
                          : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: col }}
                    />
                  ))}
                </div>
              </div>

              {/* Starter Financial Template Toggle */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  regSeedTemplate
                    ? isDark
                      ? 'bg-blue-950/30 border-blue-800'
                      : 'bg-blue-50/70 border-blue-200'
                    : isDark
                    ? 'bg-slate-950 border-slate-800'
                    : 'bg-slate-50 border-slate-200'
                }`}
                onClick={() => setRegSeedTemplate(!regSeedTemplate)}
              >
                <div>
                  <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">
                    Seed Starter Ledger Template
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    {regSeedTemplate ? 'Preload sample expense categories and mock salary' : 'Start with completely empty clean vault'}
                  </span>
                </div>
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center ${
                    regSeedTemplate ? 'bg-blue-600 text-white' : 'border border-slate-400'
                  }`}
                >
                  {regSeedTemplate && <CheckCircle2 size={14} />}
                </div>
              </div>

              {/* Register Submit Button */}
              <button
                id="auth-register-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-blue-700 hover:bg-blue-600 active:scale-[0.99] text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-blue-700/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Sparkles size={15} />
                <span>{loading ? 'Creating Private Vault...' : 'Create Account & Unlock Vault'}</span>
                <ArrowRight size={15} />
              </button>
            </form>
          )}
        </div>

        {/* Security & Privacy Guarantee Footer */}
        <div className="mt-5 p-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/50 backdrop-blur-sm flex items-start gap-3">
          <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
          <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong className="text-slate-700 dark:text-slate-300 font-semibold block">
              100% Client-Scoped Vault Isolation
            </strong>
            Data for each Login ID is encrypted and partitioned under separate namespaces. Users cannot inspect or alter another person's transactions, salary allocations, borrowings, or to-dos.
          </div>
        </div>
      </div>
    </div>
  );
};
