import React, { useState, useMemo } from 'react';
import { UserProfile, CurrencyConfig, UIColorTheme } from '../types';
import {
  getRegisteredUsers,
  adminCreateUser,
  adminResetUserPassword,
  adminToggleUserStatus,
  adminUpdateUserRole,
  adminDeleteUser,
  adminGetUserStats,
} from '../services/authService';
import { formatCurrency } from '../utils/currencies';
import {
  Users,
  UserPlus,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Key,
  Trash2,
  Power,
  Search,
  CheckCircle2,
  XCircle,
  TrendingUp,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  AlertTriangle,
  LogIn,
  X,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface MasterUserManagementProps {
  currentUser: UserProfile;
  currency: CurrencyConfig;
  theme: 'dark' | 'light';
  uiColorTheme?: UIColorTheme;
  onSwitchToUser: (targetUser: UserProfile) => void;
  onRefreshCurrentUser?: () => void;
}

const AVATAR_COLORS = [
  '#4f46e5', // Indigo
  '#059669', // Emerald
  '#2563eb', // Blue
  '#7c3aed', // Violet
  '#e11d48', // Rose
  '#d97706', // Amber
  '#0d9488', // Teal
  '#475569', // Slate
];

export const MasterUserManagement: React.FC<MasterUserManagementProps> = ({
  currentUser,
  currency,
  theme,
  uiColorTheme,
  onSwitchToUser,
}) => {
  const isDark = theme === 'dark';
  const [users, setUsers] = useState<UserProfile[]>(() => getRegisteredUsers());
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // New user modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newLoginId, setNewLoginId] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [newEmail, setNewEmail] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newAvatarColor, setNewAvatarColor] = useState('#4f46e5');
  const [seedWithTemplate, setSeedWithTemplate] = useState(true);
  const [createError, setCreateError] = useState('');

  // Password reset modal state
  const [resetTargetUser, setResetTargetUser] = useState<UserProfile | null>(null);
  const [newResetPassword, setNewResetPassword] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [resetErrorMsg, setResetErrorMsg] = useState('');

  // Delete confirmation modal state
  const [deleteTargetUser, setDeleteTargetUser] = useState<UserProfile | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const refreshUsersList = () => {
    setUsers(getRegisteredUsers());
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.loginId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchRole = roleFilter === 'all' || u.role === roleFilter;
      const matchStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Metric stats
  const totalUsers = users.length;
  const activeCount = users.filter((u) => u.status === 'active').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;
  const suspendedCount = users.filter((u) => u.status === 'suspended').length;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');
    try {
      await adminCreateUser({
        loginId: newLoginId,
        name: newName,
        password: newPassword,
        role: newRole,
        email: newEmail,
        notes: newNotes,
        avatarColor: newAvatarColor,
        seedWithTemplate,
      });
      refreshUsersList();
      setIsCreateModalOpen(false);
      // Reset form
      setNewLoginId('');
      setNewName('');
      setNewPassword('');
      setNewEmail('');
      setNewNotes('');
      setNewRole('user');
    } catch (err: any) {
      setCreateError(err.message || 'Failed to create user.');
    }
  };

  const handleToggleStatus = (target: UserProfile) => {
    try {
      adminToggleUserStatus(target.loginId);
      refreshUsersList();
    } catch (err: any) {
      alert(err.message || 'Could not update user status.');
    }
  };

  const handleToggleRole = (target: UserProfile) => {
    try {
      const nextRole = target.role === 'admin' ? 'user' : 'admin';
      adminUpdateUserRole(target.loginId, nextRole);
      refreshUsersList();
    } catch (err: any) {
      alert(err.message || 'Could not update user role.');
    }
  };

  const handleExecutePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    setResetErrorMsg('');
    setResetSuccessMsg('');
    try {
      await adminResetUserPassword(resetTargetUser.loginId, newResetPassword);
      setResetSuccessMsg(`Password successfully updated for @${resetTargetUser.loginId}`);
      setTimeout(() => {
        setResetTargetUser(null);
        setNewResetPassword('');
        setResetSuccessMsg('');
      }, 1200);
    } catch (err: any) {
      setResetErrorMsg(err.message || 'Failed to reset password.');
    }
  };

  const handleExecuteDelete = () => {
    if (!deleteTargetUser) return;
    setDeleteError('');
    try {
      adminDeleteUser(deleteTargetUser.loginId);
      refreshUsersList();
      setDeleteTargetUser(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete user.');
    }
  };

  if (currentUser.role !== 'admin' && currentUser.loginId !== 'admin') {
    return (
      <div
        className={`p-8 rounded-2xl border text-center space-y-4 max-w-lg mx-auto mt-12 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
        }`}
      >
        <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
          <Lock size={22} />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Access Restricted</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Standard User (@{currentUser.loginId}) only has access to their own personal stored ledger.
            Master User Administration and Google account synchronization are strictly reserved for the Master Admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Header */}
      <div
        className={`p-6 rounded-2xl border transition-all ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 text-white'
            : 'bg-white border-slate-200/90 text-slate-800 shadow-sm'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md"
                style={{
                  backgroundColor: uiColorTheme ? (isDark ? uiColorTheme.darkHex : uiColorTheme.hex) : '#4338ca',
                }}
              >
                <ShieldCheck size={22} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight">Master User & Access Control</h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/15 text-indigo-500 border border-indigo-500/30">
                    Master Admin
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Create accounts, assign unique Login IDs, reset security PINs, and audit private isolated ledger vaults.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="refresh-users-btn"
              onClick={refreshUsersList}
              className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                isDark
                  ? 'border-slate-800 bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                  : 'border-slate-200 bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title="Refresh User Registry"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              id="provision-new-user-btn"
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
              style={{
                backgroundColor: uiColorTheme ? (isDark ? uiColorTheme.darkHex : uiColorTheme.hex) : '#4f46e5',
              }}
            >
              <UserPlus size={16} strokeWidth={2.2} />
              <span>Add / Provision User</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800/70' : 'bg-slate-50/80 border-slate-200/80'}`}>
            <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">Total Users</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black">{totalUsers}</span>
              <span className="text-[10px] text-slate-500 font-mono">accounts</span>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800/70' : 'bg-slate-50/80 border-slate-200/80'}`}>
            <span className="text-[11px] font-semibold text-emerald-500 block mb-0.5">Active Accounts</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">{activeCount}</span>
              <span className="text-[10px] text-slate-500 font-mono">operational</span>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800/70' : 'bg-slate-50/80 border-slate-200/80'}`}>
            <span className="text-[11px] font-semibold text-indigo-500 block mb-0.5">Master Admins</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{adminCount}</span>
              <span className="text-[10px] text-slate-500 font-mono">privileged</span>
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/60 border-slate-800/70' : 'bg-slate-50/80 border-slate-200/80'}`}>
            <span className="text-[11px] font-semibold text-amber-500 block mb-0.5">Suspended</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-black text-amber-600 dark:text-amber-400">{suspendedCount}</span>
              <span className="text-[10px] text-slate-500 font-mono">locked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="admin-user-search-input"
            type="text"
            placeholder="Search by name, @loginId, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs outline-none transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500 focus:border-indigo-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-indigo-500 shadow-xs'
            }`}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <select
            id="admin-role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
            }`}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins Only</option>
            <option value="user">Standard Users</option>
          </select>

          <select
            id="admin-status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold outline-none ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
            }`}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="suspended">Suspended Only</option>
          </select>
        </div>
      </div>

      {/* User Accounts List */}
      <div className="space-y-3">
        {filteredUsers.map((user) => {
          const stats = adminGetUserStats(user.loginId);
          const isCurrentActive = user.loginId.toLowerCase() === currentUser.loginId.toLowerCase();
          const isPrimaryAdmin = user.loginId.toLowerCase() === 'admin';

          return (
            <div
              key={user.id}
              className={`p-4.5 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700'
                  : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* User Identity */}
                <div className="flex items-start gap-3.5">
                  <div
                    className="w-11 h-11 rounded-xl text-white font-black text-base flex items-center justify-center shrink-0 shadow-sm"
                    style={{ backgroundColor: user.avatarColor || '#4f46e5' }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-sm">{user.name}</span>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        @{user.loginId}
                      </span>
                      {user.role === 'admin' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/15 text-purple-500 border border-purple-500/30 flex items-center gap-1">
                          <ShieldCheck size={11} />
                          Admin
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-500/15 text-slate-500 border border-slate-500/30">
                          User
                        </span>
                      )}
                      {user.status === 'active' ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1">
                          <AlertTriangle size={11} />
                          Suspended
                        </span>
                      )}
                      {isCurrentActive && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500 text-white shadow-xs">
                          You (Current)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-1.5 text-[11px] text-slate-400 flex-wrap">
                      {user.email && <span>Email: {user.email}</span>}
                      <span>Created: {new Date(user.createdAt).toLocaleDateString()}</span>
                      <span>Last Login: {user.lastLoginAt === 'Never' ? 'Never' : new Date(user.lastLoginAt).toLocaleDateString()}</span>
                    </div>

                    {user.notes && (
                      <p className={`mt-1.5 text-xs italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        "{user.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Vault Data Summary Stats */}
                <div className="flex items-center gap-4 py-2 px-3 rounded-xl border bg-slate-50/60 dark:bg-slate-950/40 border-slate-100 dark:border-slate-800/80 text-xs shrink-0 flex-wrap">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Transactions</span>
                    <span className="font-mono font-bold">{stats.transactionCount}</span>
                  </div>
                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Cash Balance</span>
                    <span className={`font-mono font-bold ${stats.netBalance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {formatCurrency(stats.netBalance, currency)}
                    </span>
                  </div>
                  <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Total Debt</span>
                    <span className={`font-mono font-bold ${stats.totalDebt > 0 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {formatCurrency(stats.totalDebt, currency)}
                    </span>
                  </div>
                  {stats.googleSheetSync && (
                    <>
                      <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
                      <div className="flex items-center gap-1 text-[11px] text-emerald-500 font-semibold" title="Synced to Google Sheets">
                        <FileSpreadsheet size={13} />
                        <span>Sheets Connected</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Actions Toolbar */}
                <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                  {/* Switch into vault */}
                  <button
                    id={`switch-vault-btn-${user.loginId}`}
                    onClick={() => onSwitchToUser(user)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                      isCurrentActive
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                    title="Switch session and open this user's vault"
                  >
                    <LogIn size={13} />
                    <span>{isCurrentActive ? 'Active' : 'Open Vault'}</span>
                  </button>

                  {/* Reset Password */}
                  <button
                    id={`reset-pwd-btn-${user.loginId}`}
                    onClick={() => {
                      setResetTargetUser(user);
                      setNewResetPassword('');
                      setResetErrorMsg('');
                      setResetSuccessMsg('');
                    }}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isDark
                        ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                    }`}
                    title="Admin Reset Password / PIN"
                  >
                    <Key size={14} />
                  </button>

                  {/* Toggle Status (Active / Suspended) */}
                  {!isPrimaryAdmin && (
                    <button
                      id={`toggle-status-btn-${user.loginId}`}
                      onClick={() => handleToggleStatus(user)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        user.status === 'active'
                          ? isDark
                            ? 'border-slate-800 hover:bg-amber-950/40 text-slate-400 hover:text-amber-400'
                            : 'border-slate-200 hover:bg-amber-50 text-slate-500 hover:text-amber-600'
                          : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'
                      }`}
                      title={user.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                    >
                      <Power size={14} />
                    </button>
                  )}

                  {/* Toggle Role */}
                  {!isPrimaryAdmin && (
                    <button
                      id={`toggle-role-btn-${user.loginId}`}
                      onClick={() => handleToggleRole(user)}
                      className={`p-1.5 rounded-lg border text-[11px] font-bold transition-colors ${
                        user.role === 'admin'
                          ? 'border-purple-500/40 bg-purple-500/10 text-purple-400'
                          : isDark
                          ? 'border-slate-800 hover:bg-slate-800 text-slate-400'
                          : 'border-slate-200 hover:bg-slate-100 text-slate-500'
                      }`}
                      title={user.role === 'admin' ? 'Demote to User' : 'Promote to Master Admin'}
                    >
                      <ShieldCheck size={14} />
                    </button>
                  )}

                  {/* Delete User */}
                  {!isPrimaryAdmin && (
                    <button
                      id={`delete-user-btn-${user.loginId}`}
                      onClick={() => setDeleteTargetUser(user)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        isDark
                          ? 'border-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400'
                          : 'border-slate-200 hover:bg-rose-50 text-slate-500 hover:text-rose-600'
                      }`}
                      title="Delete User and Wipe Vault"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 border rounded-2xl border-dashed border-slate-300 dark:border-slate-800">
            <Users size={32} className="mx-auto text-slate-400 mb-2" />
            <h3 className="font-bold text-sm">No accounts found</h3>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search query or role filter.</p>
          </div>
        )}
      </div>

      {/* MODAL: Provision New User */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-lg rounded-2xl border shadow-2xl p-6 transition-all ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
                  style={{
                    backgroundColor: uiColorTheme ? (isDark ? uiColorTheme.darkHex : uiColorTheme.hex) : '#4f46e5',
                  }}
                >
                  <UserPlus size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold">Provision New User Account</h2>
                  <p className="text-xs text-slate-400">Add a member and create their private isolated vault</p>
                </div>
              </div>
              <button
                id="close-create-user-modal"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 mt-5">
              {createError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{createError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Login ID */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Login ID (Unique) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-xs">@</span>
                    <input
                      id="new-user-login-id"
                      type="text"
                      required
                      placeholder="e.g. john_doe"
                      value={newLoginId}
                      onChange={(e) => setNewLoginId(e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, ''))}
                      className={`w-full pl-7 pr-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                        isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                {/* Display Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Display Name *
                  </label>
                  <input
                    id="new-user-name"
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Initial Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Initial Password / PIN *
                  </label>
                  <input
                    id="new-user-password"
                    type="text"
                    required
                    placeholder="Min 4 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Account Role
                  </label>
                  <select
                    id="new-user-role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="user">Standard User (Personal Vault Only)</option>
                    <option value="admin">Master Administrator (Full Access)</option>
                  </select>
                </div>
              </div>

              {/* Email & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    id="new-user-email"
                    type="email"
                    placeholder="user@example.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                    Admin Notes (Optional)
                  </label>
                  <input
                    id="new-user-notes"
                    type="text"
                    placeholder="e.g. Sales team account"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${
                      isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Avatar Color */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                  Avatar Accent Color
                </label>
                <div className="flex items-center gap-2">
                  {AVATAR_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewAvatarColor(color)}
                      className={`w-7 h-7 rounded-lg transition-transform ${
                        newAvatarColor === color ? 'scale-110 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Template Seed Option */}
              <div
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer ${
                  isDark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
                }`}
                onClick={() => setSeedWithTemplate(!seedWithTemplate)}
              >
                <input
                  id="new-user-seed-checkbox"
                  type="checkbox"
                  checked={seedWithTemplate}
                  onChange={(e) => setSeedWithTemplate(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold block">Pre-load Starter Blueprint</span>
                  <span className="text-[11px] text-slate-400 block">
                    Include initial demo transactions, sample credit card, and budget sections to help them start.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                    isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Cancel
                </button>
                <button
                  id="confirm-create-user-btn"
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all"
                  style={{
                    backgroundColor: uiColorTheme ? (isDark ? uiColorTheme.darkHex : uiColorTheme.hex) : '#4f46e5',
                  }}
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Admin Password Reset */}
      {resetTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Key size={18} className="text-amber-500" />
                <h3 className="font-bold text-sm">Reset Password for @{resetTargetUser.loginId}</h3>
              </div>
              <button onClick={() => setResetTargetUser(null)} className="text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleExecutePasswordReset} className="mt-4 space-y-3">
              {resetErrorMsg && (
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-semibold">
                  {resetErrorMsg}
                </div>
              )}
              {resetSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-semibold">
                  {resetSuccessMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-1">
                  Enter New Password / Security PIN
                </label>
                <input
                  id="admin-reset-pwd-input"
                  type="text"
                  required
                  placeholder="At least 4 characters"
                  value={newResetPassword}
                  onChange={(e) => setNewResetPassword(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-mono outline-none ${
                    isDark ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setResetTargetUser(null)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  id="admin-confirm-reset-pwd-btn"
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-xs"
                >
                  Save New Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Delete User Confirmation (MANDATORY per destructive guidelines) */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 text-rose-500 mb-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-900 dark:text-white">Delete User & Wipe Vault?</h3>
                <span className="text-xs text-rose-500 font-semibold">Irreversible Action</span>
              </div>
            </div>

            <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
              Are you sure you want to delete <strong className="text-rose-500">@{deleteTargetUser.loginId}</strong> ({deleteTargetUser.name})?
              This will permanently delete their account credentials and wipe all of their isolated transaction, liability, and budget data from this device.
            </p>

            {deleteError && (
              <div className="mt-3 p-2.5 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-semibold">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                  isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                id="confirm-delete-user-btn"
                type="button"
                onClick={handleExecuteDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-sm"
              >
                Confirm Deletion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
