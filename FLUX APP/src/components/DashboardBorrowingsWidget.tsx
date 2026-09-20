import React from 'react';
import { CreditCardBorrowing, FriendBorrowing, CurrencyConfig } from '../types';
import { formatCurrency } from '../utils/currencies';
import {
  CreditCard,
  Users,
  ArrowRight,
  TrendingDown,
  Plus,
  Edit2,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface DashboardBorrowingsWidgetProps {
  creditCards: CreditCardBorrowing[];
  friendBorrowings: FriendBorrowing[];
  currency: CurrencyConfig;
  onNavigateToBorrowings: () => void;
  onOpenCreditCardModal: (card?: CreditCardBorrowing) => void;
  onOpenFriendModal: (borrowing?: FriendBorrowing) => void;
  theme?: 'dark' | 'light';
}

export const DashboardBorrowingsWidget: React.FC<DashboardBorrowingsWidgetProps> = ({
  creditCards,
  friendBorrowings,
  currency,
  onNavigateToBorrowings,
  onOpenCreditCardModal,
  onOpenFriendModal,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  const totalCreditDebt = creditCards.reduce((acc, c) => acc + c.amountBorrowed, 0);
  const totalFriendDebt = friendBorrowings.reduce((acc, f) => acc + f.amountBorrowed, 0);

  return (
    <div className="space-y-3">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-sm font-semibold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            Borrowings & Outstanding Debts
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Track and update liabilities borrowed from credit cards and friends
          </p>
        </div>

        <button
          onClick={onNavigateToBorrowings}
          className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${
            isDark
              ? 'text-indigo-400 hover:text-indigo-300'
              : 'text-indigo-600 hover:text-indigo-700'
          }`}
        >
          <span>Open Full Tracker</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Two Dedicated Split Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SECTION 1: Credit Card Borrowings */}
        <div
          className={`card rounded-xl p-5 border flex flex-col justify-between transition-colors duration-200 ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 shadow-xl backdrop-blur-sm'
              : 'bg-white border-slate-200/90 shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                  }`}
                >
                  <CreditCard size={15} />
                </div>
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Credit Card Borrowings
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {creditCards.length} Card{creditCards.length === 1 ? '' : 's'} Active
                  </span>
                </div>
              </div>

              <button
                onClick={() => onOpenCreditCardModal()}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                <Plus size={12} />
                <span>Add Card</span>
              </button>
            </div>

            {/* Total Display */}
            <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Card Balance</span>
              <span className="text-lg font-bold font-mono-numbers text-rose-600 dark:text-rose-400">
                {formatCurrency(totalCreditDebt, currency)}
              </span>
            </div>

            {/* Credit Card List */}
            <div className="space-y-2">
              {creditCards.slice(0, 3).map((card) => (
                <div
                  key={card.id}
                  className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                    isDark
                      ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span>{card.cardName}</span>
                      <span className="text-[10px] text-slate-400 font-normal">({card.bankOrIssuer})</span>
                    </div>
                    {card.billingDueDate && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Calendar size={10} />
                        <span>Due: {card.billingDueDate}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold font-mono-numbers text-slate-900 dark:text-slate-100">
                      {formatCurrency(card.amountBorrowed, currency)}
                    </span>
                    <button
                      onClick={() => onOpenCreditCardModal(card)}
                      className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {creditCards.length > 3 ? `+ ${creditCards.length - 3} more cards` : 'All cards shown'}
            </span>
            <button
              onClick={onNavigateToBorrowings}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Cards</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {/* SECTION 2: Borrowed From Friends */}
        <div
          className={`card rounded-xl p-5 border flex flex-col justify-between transition-colors duration-200 ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 shadow-xl backdrop-blur-sm'
              : 'bg-white border-slate-200/90 shadow-sm'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                  }`}
                >
                  <Users size={15} />
                </div>
                <div>
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Borrowed From Friends
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {friendBorrowings.filter((f) => f.amountBorrowed > 0).length} Unsettled
                  </span>
                </div>
              </div>

              <button
                onClick={() => onOpenFriendModal()}
                className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <Plus size={12} />
                <span>Add Friend</span>
              </button>
            </div>

            {/* Total Display */}
            <div className="mb-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Total Owed to Friends</span>
              <span className="text-lg font-bold font-mono-numbers text-amber-600 dark:text-amber-400">
                {formatCurrency(totalFriendDebt, currency)}
              </span>
            </div>

            {/* Friends List */}
            <div className="space-y-2">
              {friendBorrowings.slice(0, 3).map((f) => (
                <div
                  key={f.id}
                  className={`p-2.5 rounded-lg border flex items-center justify-between text-xs transition-colors ${
                    isDark
                      ? 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <span>{f.friendName}</span>
                      {f.amountBorrowed <= 0 && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 font-bold">
                          Settled
                        </span>
                      )}
                    </div>
                    {f.expectedPaybackDate && f.amountBorrowed > 0 && (
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <Calendar size={10} />
                        <span>Payback: {f.expectedPaybackDate}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold font-mono-numbers ${
                        f.amountBorrowed <= 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {formatCurrency(f.amountBorrowed, currency)}
                    </span>
                    <button
                      onClick={() => onOpenFriendModal(f)}
                      className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              {friendBorrowings.length > 3
                ? `+ ${friendBorrowings.length - 3} more friends`
                : 'All records shown'}
            </span>
            <button
              onClick={onNavigateToBorrowings}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <span>Manage Friends</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
