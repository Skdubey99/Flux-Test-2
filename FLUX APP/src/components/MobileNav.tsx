import React from 'react';
import { ViewMode, UIColorTheme, UserProfile } from '../types';
import { LayoutDashboard, Receipt, HandCoins, CheckSquare, Settings, Plus, WalletCards, ShieldCheck } from 'lucide-react';

interface MobileNavProps {
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  onOpenNewTransaction: () => void;
  theme?: 'dark' | 'light';
  todosCount?: number;
  uiColorTheme?: UIColorTheme;
  currentUser?: UserProfile | null;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  view,
  onViewChange,
  onOpenNewTransaction,
  theme = 'light',
  todosCount = 0,
  uiColorTheme,
  currentUser,
}) => {
  const isDark = theme === 'dark';
  const activeColorHex = uiColorTheme ? (isDark ? uiColorTheme.darkHex : uiColorTheme.hex) : '#4f46e5';

  return (
    <div
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl px-1.5 py-1.5 flex items-center justify-around select-none border-t transition-colors duration-200 ${
        isDark
          ? 'bg-slate-950/90 border-slate-800'
          : 'bg-white/95 border-slate-100 shadow-[0_-2px_15px_rgba(0,0,0,0.03)]'
      }`}
    >
      <button
        id="mobile-nav-dashboard"
        onClick={() => onViewChange('dashboard')}
        style={view === 'dashboard' ? { color: activeColorHex } : undefined}
        className={`flex flex-col items-center gap-0.5 p-1 text-xs transition-colors ${
          view === 'dashboard'
            ? 'font-semibold'
            : isDark
            ? 'text-slate-400'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <LayoutDashboard size={18} />
        <span className="text-[9px]">Home</span>
      </button>

      <button
        id="mobile-nav-transactions"
        onClick={() => onViewChange('transactions')}
        style={view === 'transactions' ? { color: activeColorHex } : undefined}
        className={`flex flex-col items-center gap-0.5 p-1 text-xs transition-colors ${
          view === 'transactions'
            ? 'font-semibold'
            : isDark
            ? 'text-slate-400'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Receipt size={18} />
        <span className="text-[9px]">Ledger</span>
      </button>

      {/* Center Action Button */}
      <button
        id="mobile-nav-add"
        onClick={onOpenNewTransaction}
        style={{ backgroundColor: activeColorHex }}
        className={`w-10 h-10 -mt-4 rounded-full text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform ${
          isDark
            ? 'border-2 border-slate-900 shadow-[0_0_20px_rgba(0,0,0,0.5)]'
            : 'border-2 border-white shadow-md'
        }`}
      >
        <Plus size={20} strokeWidth={2.5} />
      </button>

      <button
        id="mobile-nav-borrowings"
        onClick={() => onViewChange('borrowings')}
        style={view === 'borrowings' ? { color: activeColorHex } : undefined}
        className={`flex flex-col items-center gap-0.5 p-1 text-xs transition-colors ${
          view === 'borrowings'
            ? 'font-semibold'
            : isDark
            ? 'text-slate-400'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <HandCoins size={18} />
        <span className="text-[9px]">Debts</span>
      </button>

      <button
        id="mobile-nav-todos"
        onClick={() => onViewChange('todos')}
        style={view === 'todos' ? { color: activeColorHex } : undefined}
        className={`relative flex flex-col items-center gap-0.5 p-1 text-xs transition-colors ${
          view === 'todos'
            ? 'font-semibold'
            : isDark
            ? 'text-slate-400'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <CheckSquare size={18} />
        <span className="text-[9px]">To-Do</span>
        {todosCount > 0 && (
          <span
            style={{ backgroundColor: activeColorHex }}
            className="absolute top-0 right-1 w-2 h-2 rounded-full ring-2 ring-white dark:ring-slate-950"
          />
        )}
      </button>

      <button
        id="mobile-nav-salary"
        onClick={() => onViewChange('salary')}
        style={view === 'salary' ? { color: activeColorHex } : undefined}
        className={`flex flex-col items-center gap-0.5 p-1 text-xs transition-colors ${
          view === 'salary'
            ? 'font-semibold'
            : isDark
            ? 'text-slate-400'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <WalletCards size={18} />
        <span className="text-[9px]">Salary</span>
      </button>

      {(currentUser?.role === 'admin' || currentUser?.loginId === 'admin') && (
        <button
          id="mobile-nav-master-access"
          onClick={() => onViewChange('users')}
          style={view === 'users' ? { color: activeColorHex } : undefined}
          className={`flex flex-col items-center gap-0.5 p-1 text-xs transition-colors ${
            view === 'users'
              ? 'font-semibold'
              : isDark
              ? 'text-slate-400'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShieldCheck size={18} />
          <span className="text-[9px]">Master</span>
        </button>
      )}

      <button
        id="mobile-nav-settings"
        onClick={() => onViewChange('settings')}
        style={view === 'settings' ? { color: activeColorHex } : undefined}
        className={`flex flex-col items-center gap-0.5 p-1 text-xs transition-colors ${
          view === 'settings'
            ? 'font-semibold'
            : isDark
            ? 'text-slate-400'
            : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <Settings size={18} />
        <span className="text-[9px]">Config</span>
      </button>
    </div>
  );
};
