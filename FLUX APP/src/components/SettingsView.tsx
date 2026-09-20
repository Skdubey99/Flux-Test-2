import React, { useRef, useState } from 'react';
import {
  CurrencyConfig,
  Transaction,
  CreditCardBorrowing,
  FriendBorrowing,
  TodoItem,
  SalaryConfig,
  UIColorId,
  HeaderStyleId,
  UserProfile,
  GoogleSheetSyncInfo,
} from '../types';
import { CURRENCIES } from '../utils/currencies';
import { UI_COLOR_THEMES, HEADER_STYLE_OPTIONS, getUIColorTheme } from '../utils/themeColors';
import { INITIAL_TRANSACTIONS } from '../data/defaultTransactions';
import { INITIAL_CREDIT_CARDS, INITIAL_FRIEND_BORROWINGS } from '../data/defaultBorrowings';
import { INITIAL_TODOS } from '../data/defaultTodos';
import { INITIAL_SALARY_CONFIG } from '../data/defaultSalary';
import { GoogleSheetsSyncCard } from './GoogleSheetsSyncCard';
import {
  Palette,
  Coins,
  Database,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  Check,
  AlertTriangle,
  HandCoins,
  CheckSquare,
  WalletCards,
  LayoutTemplate,
  Sparkles,
  Lock,
  User,
  Users,
  KeyRound,
  LogOut,
  ShieldCheck,
  UserCheck,
  Flame,
} from 'lucide-react';

interface SettingsViewProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  currency: CurrencyConfig;
  onCurrencyChange: (c: CurrencyConfig) => void;
  transactions: Transaction[];
  onSetTransactions: (txns: Transaction[]) => void;
  creditCards?: CreditCardBorrowing[];
  onSetCreditCards?: (cards: CreditCardBorrowing[]) => void;
  friendBorrowings?: FriendBorrowing[];
  onSetFriendBorrowings?: (friends: FriendBorrowing[]) => void;
  todos?: TodoItem[];
  onSetTodos?: (todos: TodoItem[]) => void;
  salaryConfig?: SalaryConfig;
  onSetSalaryConfig?: (salary: SalaryConfig) => void;
  uiColor?: UIColorId;
  onSelectUIColor?: (id: UIColorId) => void;
  headerStyle?: HeaderStyleId;
  onSelectHeaderStyle?: (id: HeaderStyleId) => void;
  currentUser?: UserProfile | null;
  googleSheetSync?: GoogleSheetSyncInfo;
  onSyncComplete?: (syncInfo: GoogleSheetSyncInfo) => void;
  onOpenAccountModal?: () => void;
  onOpenMasterAccess?: () => void;
  onLockVault?: () => void;
  onSignOut?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  theme,
  onToggleTheme,
  currency,
  onCurrencyChange,
  transactions,
  onSetTransactions,
  creditCards = [],
  onSetCreditCards,
  friendBorrowings = [],
  onSetFriendBorrowings,
  todos = [],
  onSetTodos,
  salaryConfig,
  onSetSalaryConfig,
  uiColor = 'indigo',
  onSelectUIColor,
  headerStyle = 'pure-light',
  onSelectHeaderStyle,
  currentUser,
  googleSheetSync,
  onSyncComplete,
  onOpenAccountModal,
  onOpenMasterAccess,
  onLockVault,
  onSignOut,
}) => {
  const isDark = theme === 'dark';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeThemeConfig = getUIColorTheme(uiColor);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleExportJSON = () => {
    const fullBackup = {
      transactions,
      creditCards,
      friendBorrowings,
      todos,
      salaryConfig,
      uiColor,
      headerStyle,
      exportDate: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fullBackup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `balance_ledger_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Vault backup JSON exported successfully.');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          // Legacy format with just transactions
          onSetTransactions(parsed);
          showToast(`Successfully imported ${parsed.length} ledger records.`);
        } else if (parsed && typeof parsed === 'object') {
          if (Array.isArray(parsed.transactions)) {
            onSetTransactions(parsed.transactions);
          }
          if (Array.isArray(parsed.creditCards) && onSetCreditCards) {
            onSetCreditCards(parsed.creditCards);
          }
          if (Array.isArray(parsed.friendBorrowings) && onSetFriendBorrowings) {
            onSetFriendBorrowings(parsed.friendBorrowings);
          }
          if (Array.isArray(parsed.todos) && onSetTodos) {
            onSetTodos(parsed.todos);
          }
          if (parsed.salaryConfig && onSetSalaryConfig) {
            onSetSalaryConfig(parsed.salaryConfig);
          }
          if (parsed.uiColor && onSelectUIColor) {
            onSelectUIColor(parsed.uiColor);
          }
          if (parsed.headerStyle && onSelectHeaderStyle) {
            onSelectHeaderStyle(parsed.headerStyle);
          }
          showToast('Complete vault records restored successfully.');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetSampleData = () => {
    if (confirm('Load sample fintech data? Existing records, borrowings, to-dos, and salary allocation will be replaced.')) {
      onSetTransactions(INITIAL_TRANSACTIONS);
      if (onSetCreditCards) onSetCreditCards(INITIAL_CREDIT_CARDS);
      if (onSetFriendBorrowings) onSetFriendBorrowings(INITIAL_FRIEND_BORROWINGS);
      if (onSetTodos) onSetTodos(INITIAL_TODOS);
      if (onSetSalaryConfig) onSetSalaryConfig(INITIAL_SALARY_CONFIG);
      showToast('Sample fintech transactions, borrowings, to-dos, and salary allocation restored.');
    }
  };

  const handleWipeData = () => {
    if (confirm('Are you sure you want to completely purge your personal ledger, borrowings, and to-dos? All records will be deleted.')) {
      onSetTransactions([]);
      if (onSetCreditCards) onSetCreditCards([]);
      if (onSetFriendBorrowings) onSetFriendBorrowings([]);
      if (onSetTodos) onSetTodos([]);
      showToast('All transaction, borrowing, and task records wiped.');
    }
  };

  return (
    <div className="max-w-3xl space-y-6">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="p-3 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check size={14} className="text-emerald-500" />
          {toastMessage}
        </div>
      )}

      {/* Account & Partitioned Vault Isolation */}
      {currentUser && (
        <div
          className={`card rounded-xl p-5 space-y-4 transition-colors duration-200 ${
            isDark
              ? 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm'
              : 'bg-white border border-slate-200/90 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                style={{ backgroundColor: currentUser.avatarColor || activeThemeConfig.hex }}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className={`text-sm font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                    {currentUser.name}
                  </h3>
                  {(currentUser.role === 'admin' || currentUser.loginId === 'admin') ? (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800 flex items-center gap-1">
                      <ShieldCheck size={10} />
                      Master Admin
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-bold border border-slate-300 dark:border-slate-700 flex items-center gap-1">
                      <User size={10} />
                      Standard User
                    </span>
                  )}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <ShieldCheck size={10} />
                    Private Vault Active
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800 flex items-center gap-1">
                    <Lock size={10} className="text-blue-600" />
                    Encrypted Vault
                  </span>
                </div>
                <p className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Login ID: @{currentUser.loginId} • Role: {currentUser.role === 'admin' || currentUser.loginId === 'admin' ? 'Master Administrator' : 'Standard User (Personal Data Access Only)'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenAccountModal && (
                <button
                  id="settings-switch-account-btn"
                  onClick={onOpenAccountModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <Users size={13} />
                  <span>Switch Account</span>
                </button>
              )}
              {onLockVault && (
                <button
                  id="settings-lock-vault-btn"
                  onClick={onLockVault}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Lock this vault session"
                >
                  <Lock size={13} />
                  <span>Lock</span>
                </button>
              )}
            </div>
          </div>

          <div
            className={`p-3.5 rounded-lg border text-xs leading-relaxed flex items-start gap-3 ${
              isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <ShieldCheck size={18} className="text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-slate-800 dark:text-slate-100 font-semibold mb-0.5">
                Zero-Trust Data Protection Enforced
              </strong>
              Your transactions, borrowings, salary allocations, and to-do lists are partitioned exclusively under{' '}
              <code className="font-mono text-[11px] px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800">
                flux_user_vault_{currentUser.loginId}
              </code>
              . Other users cannot see, search, or alter your financial data without your credentials.
            </div>
          </div>

          {/* Master Admin Portal Access */}
          {(currentUser.role === 'admin' || currentUser.loginId === 'admin') && onOpenMasterAccess && (
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isDark
                  ? 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200'
                  : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-bold">Master Administrator Privileges Active</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    You have global access to provision new Login IDs, reset credentials, and inspect vault statistics.
                  </p>
                </div>
              </div>
              <button
                id="settings-open-master-access-btn"
                onClick={onOpenMasterAccess}
                className="px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-500 shadow-sm shrink-0 transition-all"
              >
                Open Master User Access
              </button>
            </div>
          )}
        </div>
      )}

      {/* Google Sheets & Drive Cloud Sync - RESTRICTED EXCLUSIVELY TO MASTER ADMINISTRATOR */}
      {currentUser && (currentUser.role === 'admin' || currentUser.loginId === 'admin') && onSyncComplete && (
        <GoogleSheetsSyncCard
          currentUser={currentUser}
          transactions={transactions}
          creditCards={creditCards}
          friendBorrowings={friendBorrowings}
          salaryConfig={salaryConfig || { amount: 0, frequency: 'monthly', lastUpdated: '', sections: [] }}
          currency={currency}
          googleSheetSync={googleSheetSync}
          onSyncComplete={onSyncComplete}
          theme={theme}
          uiColorTheme={activeThemeConfig}
        />
      )}

      {/* Standard User Scoped Access Guard & Data Scope Notice */}
      {currentUser && !(currentUser.role === 'admin' || currentUser.loginId === 'admin') && (
        <div
          className={`card rounded-xl p-5 border space-y-3 transition-colors duration-200 ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 shadow-xl backdrop-blur-sm'
              : 'bg-white border-slate-200/90 shadow-sm'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
                isDark
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-blue-50 border-blue-200 text-blue-600'
              }`}
            >
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  Standard Account Scope & Data Isolation
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                  Strictly Scoped
                </span>
              </div>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Access is limited exclusively to your personal stored financial records
              </p>
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border text-xs leading-relaxed space-y-2.5 ${
              isDark ? 'bg-slate-950/70 border-slate-800/80 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <Check size={15} className="text-emerald-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900 dark:text-slate-100">Personal Data Scope:</strong> You can create, view, modify, and delete your own transactions, borrowings/credit liabilities, to-do tasks, salary allocations, and personal JSON backups.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <Lock size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900 dark:text-slate-100">Google Account Access Restricted:</strong> External Google Workspace (Sheets / Drive) synchronization and access to the Master Administrator's Google Account (<code>surajdubey033@gmail.com</code>) are disabled for standard users.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <Lock size={15} className="text-blue-500 shrink-0 mt-0.5" />
              <span>
                <strong className="text-slate-900 dark:text-slate-100">Isolated Storage Partition:</strong> Your records are isolated in client storage under your Login ID. You cannot view, search, or alter records of any other user or administrator.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Visual Identity / Theme */}
      <div
        className={`card rounded-xl p-5 space-y-6 transition-colors duration-200 ${
          isDark
            ? 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm'
            : 'bg-white border border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm transition-colors"
            style={{ backgroundColor: isDark ? activeThemeConfig.darkHex : activeThemeConfig.hex }}
          >
            <Palette size={16} />
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Visual System & Theme Customization
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Customize display mode, UI accent colors, and header bar luminosity
            </p>
          </div>
        </div>

        {/* Display Mode */}
        <div
          className={`flex items-center justify-between p-3.5 rounded-lg border ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <div>
            <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
              {isDark ? 'Dark Slate Mode' : 'Luminous Light Mode'}
            </div>
            <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isDark
                ? 'Deep Slate-950 backdrop with Slate-800 utility cards'
                : 'Crisp light slate background with high-contrast typography and subtle borders'}
            </div>
          </div>
          <button
            id="toggle-theme-settings-btn"
            onClick={onToggleTheme}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-sm'
            }`}
          >
            Switch to {isDark ? 'Light' : 'Dark'}
          </button>
        </div>

        {/* UI Accent Color Palette */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              UI Accent Color Theme
            </label>
            <span className="text-xs font-semibold" style={{ color: isDark ? activeThemeConfig.darkHex : activeThemeConfig.hex }}>
              {activeThemeConfig.name}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {UI_COLOR_THEMES.map((c) => {
              const isSelected = uiColor === c.id;
              const swatchHex = isDark ? c.darkHex : c.hex;

              return (
                <button
                  key={c.id}
                  id={`settings-color-${c.id}`}
                  onClick={() => onSelectUIColor && onSelectUIColor(c.id)}
                  className={`p-3 rounded-xl border text-left flex flex-col gap-2 transition-all ${
                    isSelected
                      ? isDark
                        ? 'border-slate-400 ring-2 ring-slate-400/30 bg-slate-800/80 shadow-md'
                        : 'border-slate-800 ring-2 ring-slate-800/20 bg-slate-50 shadow-sm'
                      : isDark
                      ? 'border-slate-800/90 bg-slate-800/30 hover:border-slate-700 hover:bg-slate-800/60'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm shrink-0"
                      style={{ backgroundColor: swatchHex }}
                    >
                      {isSelected && <Check size={12} className="text-white stroke-[3]" />}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                        Active
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold block truncate text-slate-800 dark:text-slate-100">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-slate-400 block line-clamp-1">
                      {c.description}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Header Bar Luminosity & Tone */}
        <div className="space-y-2.5 pt-2 border-t dark:border-slate-800/80">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <LayoutTemplate size={13} />
              <span>Header Bar Tone & Luminosity</span>
            </label>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Configure how bright, light, and airy the top navigation bars appear
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {HEADER_STYLE_OPTIONS.map((style) => {
              const isSelected = headerStyle === style.id;

              return (
                <button
                  key={style.id}
                  id={`settings-header-style-${style.id}`}
                  onClick={() => onSelectHeaderStyle && onSelectHeaderStyle(style.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? isDark
                        ? 'border-slate-400 ring-2 ring-slate-400/30 bg-slate-800/80 shadow-sm'
                        : 'border-slate-800 ring-2 ring-slate-800/20 bg-slate-50 shadow-sm'
                      : isDark
                      ? 'border-slate-800 bg-slate-800/30 hover:border-slate-700'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      {style.name}
                    </span>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center">
                        <Check size={10} strokeWidth={3} />
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {style.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live UI Preview Sample */}
        <div
          className={`p-3.5 rounded-xl border space-y-2.5 transition-all ${
            isDark ? 'bg-slate-850 border-slate-800' : 'bg-slate-50/70 border-slate-200/80'
          }`}
        >
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span className="uppercase tracking-wider">Live Active Theme Preview</span>
            <span className="flex items-center gap-1">
              <Sparkles size={11} style={{ color: isDark ? activeThemeConfig.darkHex : activeThemeConfig.hex }} />
              <span>Applied Globally</span>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm transition-all"
              style={{
                backgroundColor: isDark ? activeThemeConfig.darkHex : activeThemeConfig.hex,
              }}
            >
              Primary Button
            </button>

            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold border"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : activeThemeConfig.lightBgHex,
                borderColor: isDark ? 'rgba(255,255,255,0.15)' : activeThemeConfig.lightBorderHex,
                color: isDark ? activeThemeConfig.darkHex : activeThemeConfig.hex,
              }}
            >
              Themed Badge
            </span>

            <span
              className="px-3 py-1 rounded-lg text-xs font-semibold border flex items-center gap-1.5"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : activeThemeConfig.lightBgHex,
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : activeThemeConfig.lightBorderHex,
                color: isDark ? activeThemeConfig.darkHex : activeThemeConfig.hex,
              }}
            >
              <Check size={12} />
              <span>Selected Item</span>
            </span>
          </div>
        </div>
      </div>

      {/* Currency Selection */}
      <div
        className={`card rounded-xl p-5 transition-colors duration-200 ${
          isDark
            ? 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm'
            : 'bg-white border border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isDark
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
            }`}
          >
            <Coins size={16} />
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Ledger Currency
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Active denomination and localization
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {CURRENCIES.map((curr) => {
            const isSelected = currency.code === curr.code;
            return (
              <button
                key={curr.code}
                id={`currency-select-${curr.code.toLowerCase()}`}
                onClick={() => onCurrencyChange(curr)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? isDark
                      ? 'bg-indigo-500/15 border-indigo-500/50 shadow-[0_0_15px_-4px_rgba(99,102,241,0.3)]'
                      : 'bg-indigo-50 border-indigo-300 text-indigo-900 shadow-sm'
                    : isDark
                    ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-400'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-mono text-base font-bold ${
                      isDark ? 'text-slate-100' : isSelected ? 'text-indigo-700' : 'text-slate-900'
                    }`}
                  >
                    {curr.symbol}
                  </span>
                  {isSelected && <Check size={14} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />}
                </div>
                <div
                  className={`text-xs font-semibold mt-1 ${
                    isDark ? 'text-slate-200' : isSelected ? 'text-indigo-900' : 'text-slate-800'
                  }`}
                >
                  {curr.code}
                </div>
                <div className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {curr.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Storage & Data Management */}
      <div
        className={`card rounded-xl p-5 transition-colors duration-200 ${
          isDark
            ? 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm'
            : 'bg-white border border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center border ${
              isDark
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                : 'bg-indigo-50 border-indigo-200 text-indigo-600'
            }`}
          >
            <Database size={16} />
          </div>
          <div>
            <h3 className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Data & Vault Backup
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Local offline browser persistence
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                Export JSON Vault Backup
              </div>
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Download your records for safekeeping
              </div>
            </div>
            <button
              id="export-json-btn"
              onClick={handleExportJSON}
              className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors shrink-0 ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
              }`}
            >
              <Download size={14} />
              Export JSON
            </button>
          </div>

          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                Import Vault Backup
              </div>
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Restore ledger entries from a JSON file
              </div>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="hidden"
                id="vault-import-input"
              />
              <button
                id="import-json-btn"
                onClick={() => fileInputRef.current?.click()}
                className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors shrink-0 ${
                  isDark
                    ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                    : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300 shadow-sm'
                }`}
              >
                <Upload size={14} />
                Import JSON
              </button>
            </div>
          </div>

          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border ${
              isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className={`text-xs font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                Reload Sample Fintech Dataset
              </div>
              <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Populate the ledger with curated sample data
              </div>
            </div>
            <button
              id="restore-sample-btn"
              onClick={handleResetSampleData}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-xs font-semibold text-indigo-700 border border-indigo-200 transition-colors shrink-0"
            >
              <RotateCcw size={14} />
              Load Sample Data
            </button>
          </div>

          <div
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border ${
              isDark ? 'bg-rose-950/20 border-rose-900/40' : 'bg-rose-50 border-rose-200'
            }`}
          >
            <div className="flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <div>
                <div className={`text-xs font-semibold ${isDark ? 'text-rose-300' : 'text-rose-900'}`}>
                  Wipe Ledger Database
                </div>
                <div className={`text-[11px] ${isDark ? 'text-rose-400/80' : 'text-rose-700'}`}>
                  Permanently purge all entries stored in this browser
                </div>
              </div>
            </div>
            <button
              id="wipe-database-btn"
              onClick={handleWipeData}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white shadow-sm shadow-rose-600/30 transition-colors shrink-0"
            >
              <Trash2 size={14} />
              Wipe Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
