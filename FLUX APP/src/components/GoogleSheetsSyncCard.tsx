import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Transaction,
  CreditCardBorrowing,
  FriendBorrowing,
  SalaryConfig,
  CurrencyConfig,
  GoogleSheetSyncInfo,
  UIColorTheme,
} from '../types';
import {
  signInWithGoogleAccount,
  disconnectGoogleAccount,
  syncLedgerToGoogleSheet,
  getCachedGoogleAccessToken,
  getGoogleUser,
  initGoogleAuth,
} from '../services/googleWorkspaceService';
import {
  FileSpreadsheet,
  CloudUpload,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  LogOut,
  ShieldCheck,
  HardDrive,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

interface GoogleSheetsSyncCardProps {
  currentUser: UserProfile;
  transactions: Transaction[];
  creditCards: CreditCardBorrowing[];
  friendBorrowings: FriendBorrowing[];
  salaryConfig: SalaryConfig;
  currency: CurrencyConfig;
  googleSheetSync?: GoogleSheetSyncInfo;
  onSyncComplete: (syncInfo: GoogleSheetSyncInfo) => void;
  theme: 'dark' | 'light';
  uiColorTheme?: UIColorTheme;
}

export const GoogleSheetsSyncCard: React.FC<GoogleSheetsSyncCardProps> = ({
  currentUser,
  transactions,
  creditCards,
  friendBorrowings,
  salaryConfig,
  currency,
  googleSheetSync,
  onSyncComplete,
  theme,
  uiColorTheme,
}) => {
  const isDark = theme === 'dark';
  const isAdmin = currentUser.role === 'admin' || currentUser.loginId === 'admin';
  const [isConnected, setIsConnected] = useState<boolean>(() => !!getCachedGoogleAccessToken());
  const [googleUserEmail, setGoogleUserEmail] = useState<string | null>(() => getGoogleUser()?.email || null);
  const [googleUserName, setGoogleUserName] = useState<string | null>(() => getGoogleUser()?.displayName || null);
  const [googleUserPhoto, setGoogleUserPhoto] = useState<string | null>(() => getGoogleUser()?.photoURL || null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  // Confirmation Modal state (Mandatory per Skill guidelines)
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [createNewSheet, setCreateNewSheet] = useState(false);

  useEffect(() => {
    const unsubscribe = initGoogleAuth(
      (user) => {
        setIsConnected(true);
        setGoogleUserEmail(user.email);
        setGoogleUserName(user.displayName);
        setGoogleUserPhoto(user.photoURL);
      },
      () => {
        setIsConnected(false);
        setGoogleUserEmail(null);
        setGoogleUserName(null);
        setGoogleUserPhoto(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleConnectGoogle = async () => {
    if (!isAdmin) {
      setSyncError('Restricted: Only the Master Administrator can connect to Google Workspace.');
      return;
    }
    setSyncError(null);
    try {
      const { user } = await signInWithGoogleAccount();
      setIsConnected(true);
      setGoogleUserEmail(user.email);
      setGoogleUserName(user.displayName);
      setGoogleUserPhoto(user.photoURL);
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setSyncError('Google sign-in popup was closed before completing authentication.');
      } else {
        setSyncError(err.message || 'Failed to authenticate with Google.');
      }
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await disconnectGoogleAccount();
      setIsConnected(false);
      setGoogleUserEmail(null);
      setGoogleUserName(null);
      setGoogleUserPhoto(null);
      setSyncSuccessMsg(null);
    } catch (err: any) {
      setSyncError(err.message || 'Failed to disconnect Google account.');
    }
  };

  const executeSync = async () => {
    setShowConfirmModal(false);
    setIsSyncing(true);
    setSyncError(null);
    setSyncSuccessMsg(null);

    try {
      const targetExistingId = createNewSheet ? undefined : googleSheetSync?.spreadsheetId;
      const result = await syncLedgerToGoogleSheet(
        {
          userName: currentUser.name,
          loginId: currentUser.loginId,
          transactions,
          creditCards,
          friendBorrowings,
          salaryConfig,
          currency,
        },
        targetExistingId
      );

      onSyncComplete(result);
      setSyncSuccessMsg(`Successfully synced ${transactions.length} transactions & ${creditCards.length + friendBorrowings.length} debt records to Google Sheets!`);
    } catch (err: any) {
      console.error('Sync error:', err);
      setSyncError(err.message || 'Failed to sync ledger with Google Sheets. Please check permissions.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div
      className={`p-6 rounded-2xl border transition-all ${
        isDark ? 'bg-slate-900/90 border-slate-800 text-white' : 'bg-white border-slate-200/90 text-slate-800 shadow-sm'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shadow-xs">
            <FileSpreadsheet size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold">Google Drive & Sheets Cloud Sync</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-500 border border-emerald-500/30">
                Official Google Workspace
              </span>
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Back up your private ledger to an organized, multi-tab Google Sheet in your Google Drive.
            </p>
          </div>
        </div>

        {/* Connection Control */}
        <div>
          {!isConnected ? (
            <button
              id="google-signin-btn"
              onClick={handleConnectGoogle}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs hover:shadow-sm transition-all"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  fill="#EA4335"
                />
              </svg>
              <span>Connect with Google</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                {googleUserPhoto ? (
                  <img src={googleUserPhoto} alt="Google Avatar" className="w-5 h-5 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {googleUserName?.charAt(0) || 'G'}
                  </div>
                )}
                <span className="max-w-[140px] truncate">{googleUserEmail || googleUserName}</span>
                <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              </div>

              <button
                id="google-disconnect-btn"
                onClick={handleDisconnectGoogle}
                className={`p-2 rounded-xl border transition-colors ${
                  isDark
                    ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                }`}
                title="Disconnect Google Account"
              >
                <LogOut size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {syncError && (
        <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle size={16} className="shrink-0" />
          <span>{syncError}</span>
        </div>
      )}

      {syncSuccessMsg && (
        <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* Body Content */}
      <div className="mt-5 space-y-4">
        {isConnected ? (
          <div className="space-y-4">
            {/* Sync State Card */}
            <div
              className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50/80 border-slate-200/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <HardDrive size={14} className="text-indigo-500" />
                    <span>Google Drive Destination</span>
                  </div>
                  {googleSheetSync ? (
                    <div>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                        {googleSheetSync.spreadsheetTitle}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <Clock size={11} />
                        <span>Last Synced: {new Date(googleSheetSync.lastSyncedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">
                      No Google Sheet created yet. Click sync below to generate your initial spreadsheet.
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {googleSheetSync?.spreadsheetUrl && (
                    <a
                      id="open-google-sheet-link"
                      href={googleSheetSync.spreadsheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1.5 transition-colors"
                    >
                      <ExternalLink size={13} />
                      <span>Open in Sheets</span>
                    </a>
                  )}

                  <button
                    id="init-sync-btn"
                    onClick={() => {
                      setCreateNewSheet(false);
                      setShowConfirmModal(true);
                    }}
                    disabled={isSyncing}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white shadow-md flex items-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                    style={{
                      backgroundColor: uiColorTheme ? (isDark ? uiColorTheme.darkHex : uiColorTheme.hex) : '#059669',
                    }}
                  >
                    <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                    <span>{isSyncing ? 'Syncing to Drive...' : 'Sync Now'}</span>
                  </button>
                </div>
              </div>

              {/* What will be synced */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Transactions</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                    {transactions.length} rows
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Credit Cards</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                    {creditCards.length} cards
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Friend Debts</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                    {friendBorrowings.length} entries
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Budget Allocations</span>
                  <span className="font-mono font-bold text-slate-700 dark:text-slate-200">
                    {salaryConfig?.sections?.length || 0} categories
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Disconnected State preview */
          <div
            className={`p-4 rounded-xl border border-dashed ${
              isDark ? 'bg-slate-950/40 border-slate-800 text-slate-400' : 'bg-slate-50/50 border-slate-200 text-slate-500'
            }`}
          >
            <div className="flex items-start gap-3">
              <Info size={18} className="text-indigo-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1.5">
                <p className="font-semibold text-slate-700 dark:text-slate-200">
                  Zero-Cloud-Cost Storage Alternative to Firebase
                </p>
                <p className="leading-relaxed">
                  Connecting your Google Drive allows you to export and synchronize all transaction histories, friend borrowings, credit card balances, and salary budgets directly into a personal Google Spreadsheet.
                </p>
                <div className="flex items-center gap-4 pt-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck size={12} className="text-emerald-500" />
                    Strictly stored in your personal Google Drive
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-indigo-500" />
                    Zero subscription fees or cloud database costs
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MANDATORY CONFIRMATION MODAL (Workspace Integration Guidelines) */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className={`w-full max-w-md rounded-2xl border shadow-2xl p-6 ${
              isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <CloudUpload size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Confirm Google Sheets Sync</h3>
                <span className="text-xs text-slate-400 font-medium">Google Drive File Operation</span>
              </div>
            </div>

            <div className={`text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
              This will update your Google Spreadsheet titled{' '}
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {googleSheetSync ? googleSheetSync.spreadsheetTitle : `Flux Ledger - ${currentUser.name}`}
              </span>{' '}
              with {transactions.length} transactions, {creditCards.length} credit card debts, and {friendBorrowings.length} friend borrowings.
            </div>

            {googleSheetSync && (
              <div className="mt-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={createNewSheet}
                    onChange={(e) => setCreateNewSheet(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Create a brand-new Spreadsheet instead of updating existing</span>
                </label>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                  isDark ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                id="confirm-sync-btn"
                type="button"
                onClick={executeSync}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm"
              >
                Confirm & Sync
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
