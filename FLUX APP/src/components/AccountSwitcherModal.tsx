import React, { useState } from 'react';
import { UserProfile } from '../types';
import {
  getPublicUserProfiles,
  changeUserPassword,
  loginUser,
} from '../services/authService';
import {
  User,
  LogOut,
  Lock,
  Users,
  KeyRound,
  ShieldCheck,
  X,
  Check,
  AlertCircle,
  ArrowRight,
  UserPlus,
} from 'lucide-react';

interface AccountSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSwitchUserSuccess: (user: UserProfile) => void;
  onLockVault: () => void;
  onSignOut: () => void;
  onOpenNewAccountCreation: () => void;
  theme?: 'dark' | 'light';
}

export const AccountSwitcherModal: React.FC<AccountSwitcherModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSwitchUserSuccess,
  onLockVault,
  onSignOut,
  onOpenNewAccountCreation,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const [tab, setTab] = useState<'switch' | 'password'>('switch');

  // Switch form
  const [selectedLoginId, setSelectedLoginId] = useState<string>('');
  const [switchPassword, setSwitchPassword] = useState('');
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);

  // Change password form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSuccess, setPwSuccess] = useState(false);
  const [isChangingPw, setIsChangingPw] = useState(false);

  if (!isOpen) return null;

  const allProfiles = getPublicUserProfiles();
  const otherProfiles = allProfiles.filter(
    (p) => p.loginId.toLowerCase() !== currentUser.loginId.toLowerCase()
  );

  const handleSwitchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLoginId) {
      setSwitchError('Please select a profile to switch to.');
      return;
    }
    setSwitchError(null);
    setIsSwitching(true);

    try {
      const result = await loginUser(selectedLoginId, switchPassword);
      onSwitchUserSuccess(result.user);
      onClose();
    } catch (err) {
      setSwitchError(err instanceof Error ? err.message : 'Switching account failed.');
    } finally {
      setIsSwitching(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);

    if (newPassword.length < 4) {
      setPwError('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match.');
      return;
    }

    setIsChangingPw(true);
    try {
      await changeUserPassword(currentUser.loginId, oldPassword, newPassword);
      setPwSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSuccess(false), 3000);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setIsChangingPw(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden transition-all ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm"
              style={{ backgroundColor: currentUser.avatarColor || '#4f46e5' }}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm leading-tight text-slate-900 dark:text-white">
                  {currentUser.name}
                </h3>
                {(currentUser.role === 'admin' || currentUser.loginId === 'admin') ? (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                    Master
                  </span>
                ) : (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                    Standard User
                  </span>
                )}
              </div>
              <p className="text-[11px] font-mono text-slate-400">
                Login ID: @{currentUser.loginId}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex px-5 pt-3 border-b border-slate-200 dark:border-slate-800 gap-4 text-xs font-bold">
          <button
            onClick={() => setTab('switch')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              tab === 'switch'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <Users size={14} />
            <span>Switch Vault Account</span>
          </button>
          <button
            onClick={() => setTab('password')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              tab === 'password'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <KeyRound size={14} />
            <span>Security & Password</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 max-h-[70vh] overflow-y-auto space-y-4">
          {tab === 'switch' ? (
            <div className="space-y-4">
              {switchError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{switchError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2">
                  Select Profile to Switch Into
                </label>

                {otherProfiles.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      No other profiles found on this device.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {otherProfiles.map((p) => {
                      const isSelected = selectedLoginId.toLowerCase() === p.loginId.toLowerCase();
                      return (
                        <div
                          key={p.loginId}
                          onClick={() => {
                            setSelectedLoginId(p.loginId);
                            setSwitchPassword('');
                            setSwitchError(null);
                          }}
                          className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 dark:border-indigo-500 ring-2 ring-indigo-500/20'
                              : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0"
                              style={{ backgroundColor: p.avatarColor || '#4f46e5' }}
                            >
                              {p.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">
                                {p.name}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400">
                                @{p.loginId}
                              </span>
                            </div>
                          </div>
                          {isSelected && <Check size={16} className="text-indigo-600 dark:text-indigo-400" />}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {selectedLoginId && (
                <form onSubmit={handleSwitchSubmit} className="space-y-3 pt-2">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1">
                      Enter Password for @{selectedLoginId}
                    </label>
                    <input
                      type="password"
                      required
                      value={switchPassword}
                      onChange={(e) => setSwitchPassword(e.target.value)}
                      placeholder="Enter password or PIN"
                      className={`w-full px-3 py-2 rounded-xl text-xs border ${
                        isDark
                          ? 'bg-slate-950 border-slate-700 text-slate-100'
                          : 'bg-slate-50 border-slate-300 text-slate-900'
                      } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSwitching}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <span>{isSwitching ? 'Switching...' : `Unlock @${selectedLoginId}'s Vault`}</span>
                    <ArrowRight size={14} />
                  </button>
                </form>
              )}

              <div className="pt-2 border-t dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNewAccountCreation();
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <UserPlus size={13} />
                  <span>Register Another Login ID</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-3">
              {pwError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle size={15} className="shrink-0 mt-0.5" />
                  <span>{pwError}</span>
                </div>
              )}

              {pwSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-300">
                  <Check size={15} />
                  <span>Password updated successfully!</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-slate-100'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  New Password / PIN
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 4 characters"
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-slate-100'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`w-full px-3 py-2 rounded-xl text-xs border ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-slate-100'
                      : 'bg-slate-50 border-slate-300 text-slate-900'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500/20`}
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPw}
                className="w-full mt-2 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all"
              >
                <KeyRound size={14} />
                <span>{isChangingPw ? 'Updating...' : 'Update Password'}</span>
              </button>
            </form>
          )}

          {/* Privacy info banner */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-start gap-2.5">
            <ShieldCheck size={16} className="text-emerald-500 shrink-0 mt-0.5" />
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              <strong className="text-slate-700 dark:text-slate-300">Data Vault Privacy:</strong> Your financial records are isolated under{' '}
              <code className="font-mono px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px]">
                @{currentUser.loginId}
              </code>
              . Other logged-in users cannot access your transactions.
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              onClose();
              onLockVault();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <Lock size={13} />
            <span>Lock Vault</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
