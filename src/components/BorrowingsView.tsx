import React, { useState, useMemo } from 'react';
import { CreditCardBorrowing, FriendBorrowing, CurrencyConfig } from '../types';
import { formatCurrency } from '../utils/currencies';
import {
  CreditCard,
  Users,
  Plus,
  ArrowUpRight,
  TrendingDown,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Percent,
  Landmark,
  Phone,
  Edit2,
  Trash2,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  HandCoins,
} from 'lucide-react';

interface BorrowingsViewProps {
  creditCards: CreditCardBorrowing[];
  friendBorrowings: FriendBorrowing[];
  currency: CurrencyConfig;
  onUpdateCreditCard: (card: CreditCardBorrowing) => void;
  onDeleteCreditCard: (id: string | number) => void;
  onOpenAddCreditCard: () => void;
  onOpenEditCreditCard: (card: CreditCardBorrowing) => void;
  onUpdateFriendBorrowing: (borrowing: FriendBorrowing) => void;
  onDeleteFriendBorrowing: (id: string | number) => void;
  onOpenAddFriendBorrowing: () => void;
  onOpenEditFriendBorrowing: (borrowing: FriendBorrowing) => void;
  theme?: 'dark' | 'light';
}

export const BorrowingsView: React.FC<BorrowingsViewProps> = ({
  creditCards,
  friendBorrowings,
  currency,
  onUpdateCreditCard,
  onDeleteCreditCard,
  onOpenAddCreditCard,
  onOpenEditCreditCard,
  onUpdateFriendBorrowing,
  onDeleteFriendBorrowing,
  onOpenAddFriendBorrowing,
  onOpenEditFriendBorrowing,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const [sectionFilter, setSectionFilter] = useState<'all' | 'credit_cards' | 'friends'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate totals
  const totalCreditCardDebt = useMemo(
    () => creditCards.reduce((sum, c) => sum + c.amountBorrowed, 0),
    [creditCards]
  );

  const totalFriendDebt = useMemo(
    () => friendBorrowings.reduce((sum, f) => sum + f.amountBorrowed, 0),
    [friendBorrowings]
  );

  const totalLiabilities = totalCreditCardDebt + totalFriendDebt;

  const totalCreditLimit = useMemo(
    () => creditCards.reduce((sum, c) => sum + (c.creditLimit || 0), 0),
    [creditCards]
  );

  const overallCardUtilization = totalCreditLimit > 0
    ? (totalCreditCardDebt / totalCreditLimit) * 100
    : 0;

  const activeFriendsCount = friendBorrowings.filter((f) => f.amountBorrowed > 0).length;
  const settledFriendsCount = friendBorrowings.filter((f) => f.amountBorrowed === 0).length;

  // Filtered lists based on search
  const filteredCreditCards = useMemo(() => {
    if (!searchQuery.trim()) return creditCards;
    const q = searchQuery.toLowerCase();
    return creditCards.filter(
      (c) =>
        c.cardName.toLowerCase().includes(q) ||
        c.bankOrIssuer.toLowerCase().includes(q) ||
        (c.notes && c.notes.toLowerCase().includes(q))
    );
  }, [creditCards, searchQuery]);

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friendBorrowings;
    const q = searchQuery.toLowerCase();
    return friendBorrowings.filter(
      (f) =>
        f.friendName.toLowerCase().includes(q) ||
        (f.notes && f.notes.toLowerCase().includes(q)) ||
        (f.phoneOrContact && f.phoneOrContact.toLowerCase().includes(q))
    );
  }, [friendBorrowings, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Borrowings & Liabilities Tracker
          </h2>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Track, update, and settle amounts borrowed from credit cards and friends
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="add-credit-card-btn"
            onClick={onOpenAddCreditCard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm shadow-indigo-500/25 transition-all"
          >
            <CreditCard size={15} />
            <span>+ Add Credit Card</span>
          </button>
          <button
            id="add-friend-loan-btn"
            onClick={onOpenAddFriendBorrowing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm shadow-emerald-500/25 transition-all"
          >
            <Users size={15} />
            <span>+ Add Friend Loan</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Liabilities */}
        <div
          className={`card rounded-xl p-5 border transition-all ${
            isDark
              ? 'bg-slate-900/90 border-slate-800 shadow-xl backdrop-blur-sm'
              : 'bg-white border-slate-200/90 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase font-semibold tracking-wider text-[11px]">Total Borrowed</span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                isDark
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-rose-50 border-rose-200 text-rose-600'
              }`}
            >
              <TrendingDown size={15} />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-bold font-mono-numbers tracking-tight ${
              isDark ? 'text-rose-400' : 'text-rose-600'
            }`}
          >
            {formatCurrency(totalLiabilities, currency)}
          </div>
          <div
            className={`flex items-center justify-between text-[11px] mt-3 pt-3 border-t ${
              isDark ? 'text-slate-400 border-slate-800/80' : 'text-slate-500 border-slate-100'
            }`}
          >
            <span>Active Debts</span>
            <span className="font-mono font-semibold">
              {creditCards.filter((c) => c.amountBorrowed > 0).length + activeFriendsCount} Open Accounts
            </span>
          </div>
        </div>

        {/* Credit Card Borrowings KPI */}
        <div
          className={`card rounded-xl p-5 border transition-all cursor-pointer ${
            sectionFilter === 'credit_cards'
              ? isDark
                ? 'border-indigo-500 bg-indigo-950/20'
                : 'border-indigo-500 bg-indigo-50/40'
              : isDark
              ? 'bg-slate-900/90 border-slate-800 shadow-xl backdrop-blur-sm hover:border-slate-700'
              : 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300'
          }`}
          onClick={() => setSectionFilter(sectionFilter === 'credit_cards' ? 'all' : 'credit_cards')}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase font-semibold tracking-wider text-[11px]">Credit Card Debt</span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                isDark
                  ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-600'
              }`}
            >
              <CreditCard size={15} />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-bold font-mono-numbers tracking-tight ${
              isDark ? 'text-indigo-400' : 'text-indigo-600'
            }`}
          >
            {formatCurrency(totalCreditCardDebt, currency)}
          </div>
          <div
            className={`flex items-center justify-between text-[11px] mt-3 pt-3 border-t ${
              isDark ? 'text-slate-400 border-slate-800/80' : 'text-slate-500 border-slate-100'
            }`}
          >
            <span>{creditCards.length} Cards Total</span>
            <span className="font-mono font-semibold">
              {overallCardUtilization.toFixed(1)}% Limit Used
            </span>
          </div>
        </div>

        {/* Borrowed From Friends KPI */}
        <div
          className={`card rounded-xl p-5 border transition-all cursor-pointer ${
            sectionFilter === 'friends'
              ? isDark
                ? 'border-emerald-500 bg-emerald-950/20'
                : 'border-emerald-500 bg-emerald-50/40'
              : isDark
              ? 'bg-slate-900/90 border-slate-800 shadow-xl backdrop-blur-sm hover:border-slate-700'
              : 'bg-white border-slate-200/90 shadow-sm hover:border-slate-300'
          }`}
          onClick={() => setSectionFilter(sectionFilter === 'friends' ? 'all' : 'friends')}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase font-semibold tracking-wider text-[11px]">Borrowed From Friends</span>
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
                isDark
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-600'
              }`}
            >
              <Users size={15} />
            </div>
          </div>
          <div
            className={`text-2xl sm:text-3xl font-bold font-mono-numbers tracking-tight ${
              isDark ? 'text-emerald-400' : 'text-emerald-600'
            }`}
          >
            {formatCurrency(totalFriendDebt, currency)}
          </div>
          <div
            className={`flex items-center justify-between text-[11px] mt-3 pt-3 border-t ${
              isDark ? 'text-slate-400 border-slate-800/80' : 'text-slate-500 border-slate-100'
            }`}
          >
            <span>{activeFriendsCount} Active, {settledFriendsCount} Settled</span>
            <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
              Personal IOUs
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-3 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/90'
        }`}
      >
        {/* Section View Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setSectionFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              sectionFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            All Sections
          </button>
          <button
            onClick={() => setSectionFilter('credit_cards')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              sectionFilter === 'credit_cards'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CreditCard size={13} />
            <span>Credit Cards ({creditCards.length})</span>
          </button>
          <button
            onClick={() => setSectionFilter('friends')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              sectionFilter === 'friends'
                ? 'bg-indigo-600 text-white shadow-sm'
                : isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users size={13} />
            <span>Friends ({friendBorrowings.length})</span>
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search card or friend name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-1.5 rounded-lg border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500'
                : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>
      </div>

      {/* SECTION 1: CREDIT CARD BORROWINGS */}
      {(sectionFilter === 'all' || sectionFilter === 'credit_cards') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                }`}
              >
                <CreditCard size={16} />
              </div>
              <div>
                <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Amount Borrowed from Credit Cards
                </h3>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Total outstanding card balances: {formatCurrency(totalCreditCardDebt, currency)}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenAddCreditCard}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Plus size={14} />
              <span>Add Card</span>
            </button>
          </div>

          {filteredCreditCards.length === 0 ? (
            <div
              className={`p-8 text-center rounded-xl border ${
                isDark ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <CreditCard size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">No credit cards found.</p>
              <button
                onClick={onOpenAddCreditCard}
                className="mt-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500"
              >
                + Add Your First Credit Card
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCreditCards.map((card) => {
                const limit = card.creditLimit || 0;
                const utilization = limit > 0 ? (card.amountBorrowed / limit) * 100 : 0;
                const isOverHalf = utilization >= 50;
                const isNearLimit = utilization >= 80;

                return (
                  <div
                    key={card.id}
                    className={`card rounded-xl p-5 border flex flex-col justify-between transition-all relative overflow-hidden group ${
                      isDark
                        ? 'bg-slate-900/90 border-slate-800 hover:border-indigo-500/50 shadow-md'
                        : 'bg-white border-slate-200 hover:border-indigo-300 shadow-sm'
                    }`}
                  >
                    {/* Top Row: Card Title & Issuer */}
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="space-y-0.5">
                          <span
                            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                              isDark
                                ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                                : 'bg-slate-100 text-indigo-700 border border-slate-200'
                            }`}
                          >
                            {card.bankOrIssuer}
                          </span>
                          <h4 className={`text-sm font-bold pt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {card.cardName}
                          </h4>
                        </div>

                        {/* Action buttons (Edit / Delete) */}
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onOpenEditCreditCard(card)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                            }`}
                            title="Edit Card Details"
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Amount Borrowed Big Display */}
                      <div className="space-y-1 mb-4">
                        <span className={`text-[11px] font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Amount Borrowed / Balance
                        </span>
                        <div
                          className={`text-2xl font-bold font-mono-numbers tracking-tight ${
                            card.amountBorrowed > 0
                              ? isDark
                                ? 'text-rose-400'
                                : 'text-rose-600'
                              : isDark
                              ? 'text-emerald-400'
                              : 'text-emerald-600'
                          }`}
                        >
                          {formatCurrency(card.amountBorrowed, currency)}
                        </div>
                      </div>

                      {/* Limit and Utilization Bar */}
                      {limit > 0 && (
                        <div className="space-y-1.5 mb-4">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                              Limit: {formatCurrency(limit, currency)}
                            </span>
                            <span
                              className={`font-mono font-semibold ${
                                isNearLimit
                                  ? 'text-rose-500'
                                  : isOverHalf
                                  ? 'text-amber-500'
                                  : 'text-emerald-500'
                              }`}
                            >
                              {utilization.toFixed(0)}% Utilized
                            </span>
                          </div>
                          <div
                            className={`h-2 rounded-full overflow-hidden ${
                              isDark ? 'bg-slate-800' : 'bg-slate-100'
                            }`}
                          >
                            <div
                              className={`h-full rounded-full transition-all ${
                                isNearLimit
                                  ? 'bg-rose-500'
                                  : isOverHalf
                                  ? 'bg-amber-500'
                                  : 'bg-indigo-600'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, utilization))}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Meta badges: Due Date, APR, Notes */}
                      <div className="space-y-2 text-[11px] mb-4">
                        {card.billingDueDate && (
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Calendar size={13} className="text-indigo-500" />
                            <span>Payment Due: <strong className="font-mono">{card.billingDueDate}</strong></span>
                          </div>
                        )}
                        {card.apr !== undefined && (
                          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                            <Percent size={13} className="text-amber-500" />
                            <span>Interest APR: <strong className="font-mono">{card.apr}%</strong></span>
                          </div>
                        )}
                        {card.notes && (
                          <p className={`text-[11px] italic line-clamp-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            "{card.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Primary Update Action Button */}
                    <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        Updated {card.lastUpdated}
                      </span>
                      <button
                        onClick={() => onOpenEditCreditCard(card)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                      >
                        <Edit2 size={12} />
                        <span>Update Balance</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* SECTION 2: BORROWED FROM FRIENDS */}
      {(sectionFilter === 'all' || sectionFilter === 'friends') && (
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                <Users size={16} />
              </div>
              <div>
                <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Amount Borrowed from Friends
                </h3>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Personal loans & friend IOUs: {formatCurrency(totalFriendDebt, currency)}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenAddFriendBorrowing}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <Plus size={14} />
              <span>Add Friend Loan</span>
            </button>
          </div>

          {filteredFriends.length === 0 ? (
            <div
              className={`p-8 text-center rounded-xl border ${
                isDark ? 'bg-slate-900/50 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
              }`}
            >
              <Users size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">No friend borrowings recorded.</p>
              <button
                onClick={onOpenAddFriendBorrowing}
                className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500"
              >
                + Add Friend Borrowing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredFriends.map((borrowing) => {
                const isSettled = borrowing.amountBorrowed <= 0;
                const repaidAmount = Math.max(0, borrowing.originalAmount - borrowing.amountBorrowed);
                const percentRepaid = borrowing.originalAmount > 0
                  ? (repaidAmount / borrowing.originalAmount) * 100
                  : 100;

                // Initials for avatar
                const initials = borrowing.friendName
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .substring(0, 2)
                  .toUpperCase();

                return (
                  <div
                    key={borrowing.id}
                    className={`card rounded-xl p-5 border flex flex-col justify-between transition-all relative overflow-hidden group ${
                      isDark
                        ? 'bg-slate-900/90 border-slate-800 hover:border-emerald-500/50 shadow-md'
                        : 'bg-white border-slate-200 hover:border-emerald-300 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* Top Header: Friend Name & Status Badge */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs tracking-wider ${
                              isSettled
                                ? 'bg-emerald-500/20 text-emerald-500'
                                : 'bg-indigo-500/20 text-indigo-500'
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {borrowing.friendName}
                            </h4>
                            {borrowing.phoneOrContact && (
                              <span className="text-[11px] text-slate-400 block font-mono">
                                {borrowing.phoneOrContact}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                              isSettled
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                                : percentRepaid > 0
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800'
                                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800'
                            }`}
                          >
                            {isSettled ? 'Settled' : percentRepaid > 0 ? 'Partial' : 'Active'}
                          </span>
                          <button
                            onClick={() => onOpenEditFriendBorrowing(borrowing)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
                            }`}
                            title="Edit Details"
                          >
                            <Edit2 size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Remaining Amount Owed Display */}
                      <div className="space-y-1 mb-3">
                        <span className={`text-[11px] font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          Remaining Amount Owed
                        </span>
                        <div
                          className={`text-2xl font-bold font-mono-numbers tracking-tight ${
                            isSettled
                              ? isDark
                                ? 'text-emerald-400'
                                : 'text-emerald-600'
                              : isDark
                              ? 'text-amber-400'
                              : 'text-amber-600'
                          }`}
                        >
                          {formatCurrency(borrowing.amountBorrowed, currency)}
                        </div>
                      </div>

                      {/* Repayment Progress bar */}
                      <div className="space-y-1.5 mb-4">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                            Original: {formatCurrency(borrowing.originalAmount, currency)}
                          </span>
                          <span
                            className={`font-mono font-semibold ${
                              isSettled
                                ? 'text-emerald-500'
                                : percentRepaid > 0
                                ? 'text-indigo-500'
                                : 'text-slate-400'
                            }`}
                          >
                            {percentRepaid.toFixed(0)}% Repaid
                          </span>
                        </div>
                        <div
                          className={`h-2 rounded-full overflow-hidden ${
                            isDark ? 'bg-slate-800' : 'bg-slate-100'
                          }`}
                        >
                          <div
                            className={`h-full rounded-full transition-all ${
                              isSettled ? 'bg-emerald-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, percentRepaid))}%` }}
                          />
                        </div>
                      </div>

                      {/* Dates and Notes */}
                      <div className="space-y-2 text-[11px] mb-4">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            Borrowed:
                          </span>
                          <span className="font-mono">{borrowing.borrowedDate}</span>
                        </div>

                        {borrowing.expectedPaybackDate && (
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} className="text-amber-500" />
                              Payback Goal:
                            </span>
                            <span className="font-mono font-semibold text-amber-600 dark:text-amber-400">
                              {borrowing.expectedPaybackDate}
                            </span>
                          </div>
                        )}

                        {borrowing.notes && (
                          <p className={`text-[11px] italic line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            "{borrowing.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action: Update / Repay */}
                    <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {borrowing.repayments && borrowing.repayments.length > 0
                          ? `${borrowing.repayments.length} repayment${borrowing.repayments.length > 1 ? 's' : ''}`
                          : 'No payments yet'}
                      </span>
                      <button
                        onClick={() => onOpenEditFriendBorrowing(borrowing)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                      >
                        <Edit2 size={12} />
                        <span>Update / Repay</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
