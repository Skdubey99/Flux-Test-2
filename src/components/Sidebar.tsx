import React from 'react';
import { ViewMode, CurrencyConfig, UIColorTheme, UserProfile } from '../types';
import { formatCurrency } from '../utils/currencies';
import {
  LayoutDashboard,
  Receipt,
  HandCoins,
  CheckSquare,
  PieChart,
  Settings,
  Plus,
  Sun,
  Moon,
  Zap,
  Scale,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  WalletCards,
  Palette,
  User,
  Lock,
  ChevronRight,
} from 'lucide-react';

interface SidebarProps {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onOpenNewTransaction: () => void;
  balance: number;
  currency: CurrencyConfig;
  transactionCount: number;
  borrowingsCount?: number;
  todosCount?: number;
  salaryConfigured?: boolean;
  uiColorTheme?: UIColorTheme;
  onOpenColorModal?: () => void;
  currentUser?: UserProfile | null;
  onOpenAccountModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  view,
  onViewChange,
  theme,
  onToggleTheme,
  onOpenNewTransaction,
  balance,
  currency,
  transactionCount,
  borrowingsCount = 0,
  todosCount = 0,
  salaryConfigured,
  uiColorTheme,
  onOpenColorModal,
  currentUser,
  onOpenAccountModal,
}) => {
  const navItems = [
    { id: 'dashboard' as ViewMode, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions' as ViewMode, label: 'Transactions', icon: Receipt, badge: transactionCount },
    { id: 'borrowings' as ViewMode, label: 'Borrowings & Debts', icon: HandCoins, badge: borrowingsCount > 0 ? borrowingsCount : undefined },
    { id: 'todos' as ViewMode, label: 'To-Do List', icon: CheckSquare, badge: todosCount > 0 ? todosCount : undefined },
    { id: 'salary' as ViewMode, label: 'Salary & Allocation', icon: WalletCards },
    { id: 'analytics' as ViewMode, label: 'Analytics', icon: PieChart },
    ...(currentUser?.role === 'admin' || currentUser?.loginId === 'admin'
      ? [{ id: 'users' as ViewMode, label: 'Master Access', icon: ShieldCheck, badge: 'Admin' }]
      : []),
    { id: 'settings' as ViewMode, label: 'Settings', icon: Settings },
  ];

  const isDark = theme === 'dark';

  return (
    <aside
      className={`w-64 border-r p-5 flex flex-col justify-between h-screen sticky top-0 shrink-0 z-30 select-none transition-colors duration-200 ${
        isDark
          ? 'bg-slate-900/95 border-slate-800 text-slate-100 backdrop-blur-xl'
          : 'bg-white border-slate-200/90 text-slate-800 shadow-[2px_0_12px_rgba(0,0,0,0.02)]'
      }`}
    >
      {/* Top Branding */}
      <div>
        <div
          className={`flex items-center justify-between pb-5 mb-4 border-b ${
            isDark ? 'border-slate-800/80' : 'border-slate-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md transition-colors"
                style={{
                  backgroundColor: uiColorTheme ? (isDark ? uiColorTheme.darkHex : uiColorTheme.hex) : '#1d4ed8',
                }}
              >
                <Scale size={18} strokeWidth={2.2} />
              </div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 ${isDark ? 'border-slate-900' : 'border-white'}`} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-black text-[15px] tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Balance Ledger
                </span>
                <span
                  className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded border font-bold"
                  style={{
                    backgroundColor: uiColorTheme ? (isDark ? 'rgba(255,255,255,0.08)' : uiColorTheme.lightBgHex) : undefined,
                    borderColor: uiColorTheme ? (isDark ? 'rgba(255,255,255,0.15)' : uiColorTheme.lightBorderHex) : undefined,
                    color: uiColorTheme ? (isDark ? uiColorTheme.darkHex : uiColorTheme.hex) : undefined,
                  }}
                >
                  PRO
                </span>
              </div>
              <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Financial Books & Debt
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onOpenColorModal && (
              <button
                id="theme-palette-btn-sidebar"
                onClick={onOpenColorModal}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
                title="Customize UI Color & Header Luminosity"
              >
                <Palette
                  size={16}
                  style={{ color: uiColorTheme ? (isDark ? uiColorTheme.darkHex : uiColorTheme.hex) : undefined }}
                />
              </button>
            )}
            <button
              id="theme-toggle-btn-sidebar"
              onClick={onToggleTheme}
              className={`p-1.5 rounded-lg transition-colors ${
                isDark
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
            >
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>

        {/* User Account & Vault Isolation Card */}
        {currentUser && (
          <div
            onClick={onOpenAccountModal}
            className={`mb-4 p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              isDark
                ? 'bg-slate-950/70 border-slate-800/90 hover:bg-slate-800/60'
                : 'bg-slate-50 border-slate-200/90 hover:bg-slate-100/80 shadow-xs'
            }`}
            title="Manage Vault Account / Switch User"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-7 h-7 rounded-lg text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs"
                style={{ backgroundColor: currentUser.avatarColor || '#4f46e5' }}
              >
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <span className={`text-xs font-bold block truncate leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {currentUser.name}
                </span>
                <span className="text-[10px] font-mono text-slate-400 block truncate flex items-center gap-1">
                  <Lock size={9} className="text-emerald-500" />
                  @{currentUser.loginId}
                </span>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-400 shrink-0 ml-1" />
          </div>
        )}

        {/* Action Button: New Entry */}
        <button
          id="new-entry-sidebar-btn"
          onClick={onOpenNewTransaction}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 mb-6 rounded-xl text-white text-xs font-bold uppercase tracking-wider shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
          style={{
            backgroundColor: uiColorTheme ? (isDark ? uiColorTheme.darkHex : uiColorTheme.hex) : '#4f46e5',
          }}
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>New Entry</span>
          <kbd
            className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/20 text-white"
          >
            N
          </kbd>
        </button>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? uiColorTheme
                      ? uiColorTheme.classes.activeNav
                      : isDark
                      ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_15px_-4px_rgba(99,102,241,0.25)]'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200/90 shadow-sm'
                    : isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    style={
                      isActive && uiColorTheme
                        ? { color: isDark ? uiColorTheme.darkHex : uiColorTheme.hex }
                        : undefined
                    }
                    className={
                      !isActive
                        ? isDark
                          ? 'text-slate-500'
                          : 'text-slate-400'
                        : undefined
                    }
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className="text-[10px] font-mono px-2 py-0.5 rounded-full transition-colors"
                    style={
                      isActive && uiColorTheme
                        ? {
                            backgroundColor: isDark ? uiColorTheme.darkHex : uiColorTheme.hex,
                            color: '#ffffff',
                            fontWeight: 700,
                          }
                        : undefined
                    }
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Ledger Status card */}
      <div className={`pt-4 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200/80'}`}>
        <div
          className={`p-3.5 rounded-xl border ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200/90'
          }`}
        >
          <div
            className={`flex items-center justify-between text-[11px] font-medium mb-1 ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
              Vault Health
            </span>
            <span className={`font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              Encrypted
            </span>
          </div>
          <div
            className={`text-[10px] uppercase font-semibold tracking-wider ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Net Standing
          </div>
          <div
            className={`text-base font-bold font-mono-numbers mt-0.5 ${
              balance >= 0
                ? isDark
                  ? 'text-emerald-400'
                  : 'text-emerald-600'
                : isDark
                ? 'text-rose-400'
                : 'text-rose-600'
            }`}
          >
            {formatCurrency(balance, currency)}
          </div>
        </div>

        <div className={`text-center mt-3 text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          Balance Ledger Pro
        </div>
      </div>
    </aside>
  );
};
