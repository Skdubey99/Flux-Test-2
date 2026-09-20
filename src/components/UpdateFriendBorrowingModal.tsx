import React, { useState, useEffect } from 'react';
import { FriendBorrowing, FriendRepayment, CurrencyConfig } from '../types';
import { formatCurrency } from '../utils/currencies';
import {
  Users,
  X,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Plus,
  Minus,
  Trash2,
  Clock,
  History,
  Phone,
  DollarSign,
} from 'lucide-react';

interface UpdateFriendBorrowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  borrowing: FriendBorrowing | null; // null means adding new
  currency: CurrencyConfig;
  onSave: (borrowing: FriendBorrowing) => void;
  onDelete?: (id: string | number) => void;
  theme?: 'dark' | 'light';
}

type FriendActionType = 'repay' | 'set_balance' | 'borrow_more';

export const UpdateFriendBorrowingModal: React.FC<UpdateFriendBorrowingModalProps> = ({
  isOpen,
  onClose,
  borrowing,
  currency,
  onSave,
  onDelete,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  const [activeTab, setActiveTab] = useState<'quick_action' | 'edit_details' | 'history'>('quick_action');
  const [actionType, setActionType] = useState<FriendActionType>('repay');
  const [actionAmount, setActionAmount] = useState<string>('');
  const [actionNote, setActionNote] = useState<string>('');

  // Friend details
  const [friendName, setFriendName] = useState('');
  const [amountBorrowed, setAmountBorrowed] = useState<string>('0');
  const [originalAmount, setOriginalAmount] = useState<string>('0');
  const [borrowedDate, setBorrowedDate] = useState('');
  const [expectedPaybackDate, setExpectedPaybackDate] = useState('');
  const [phoneOrContact, setPhoneOrContact] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (borrowing) {
      setFriendName(borrowing.friendName);
      setAmountBorrowed(borrowing.amountBorrowed.toString());
      setOriginalAmount(borrowing.originalAmount.toString());
      setBorrowedDate(borrowing.borrowedDate || '');
      setExpectedPaybackDate(borrowing.expectedPaybackDate || '');
      setPhoneOrContact(borrowing.phoneOrContact || '');
      setNotes(borrowing.notes || '');
      setActiveTab('quick_action');
      setActionType('repay');
      setActionAmount('');
      setActionNote('');
    } else {
      const today = new Date().toISOString().split('T')[0];
      setFriendName('');
      setAmountBorrowed('0');
      setOriginalAmount('0');
      setBorrowedDate(today);
      setExpectedPaybackDate('');
      setPhoneOrContact('');
      setNotes('');
      setActiveTab('edit_details');
      setActionAmount('');
      setActionNote('');
    }
  }, [borrowing, isOpen]);

  if (!isOpen) return null;

  const isNew = !borrowing;
  const currentBalance = borrowing ? borrowing.amountBorrowed : parseFloat(amountBorrowed) || 0;

  // Calculate new balance based on quick action
  const getProjectedBalance = (): number => {
    const val = parseFloat(actionAmount) || 0;
    if (actionType === 'repay') {
      return Math.max(0, currentBalance - val);
    } else if (actionType === 'borrow_more') {
      return currentBalance + val;
    } else if (actionType === 'set_balance') {
      return Math.max(0, val);
    }
    return currentBalance;
  };

  const handleQuickActionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!borrowing) return;

    const val = parseFloat(actionAmount) || 0;
    const now = new Date().toISOString().split('T')[0];
    const newRemaining = getProjectedBalance();

    let newStatus: 'active' | 'partial' | 'settled' = 'active';
    if (newRemaining <= 0) {
      newStatus = 'settled';
    } else if (newRemaining < borrowing.originalAmount) {
      newStatus = 'partial';
    }

    const currentRepayments = borrowing.repayments || [];
    let updatedRepayments = [...currentRepayments];

    if (actionType === 'repay' && val > 0) {
      const newRepayment: FriendRepayment = {
        id: `rep-${Date.now()}`,
        date: now,
        amount: val,
        note: actionNote.trim() || 'Repayment recorded',
      };
      updatedRepayments = [newRepayment, ...updatedRepayments];
    }

    const updated: FriendBorrowing = {
      ...borrowing,
      amountBorrowed: newRemaining,
      originalAmount:
        actionType === 'borrow_more' ? borrowing.originalAmount + val : borrowing.originalAmount,
      status: newStatus,
      lastUpdated: now,
      repayments: updatedRepayments,
    };

    onSave(updated);
    onClose();
  };

  const handleMarkSettled = () => {
    if (!borrowing) return;
    const now = new Date().toISOString().split('T')[0];
    const currentRepayments = borrowing.repayments || [];
    const remainingToSettle = borrowing.amountBorrowed;

    const updatedRepayments = remainingToSettle > 0
      ? [
          {
            id: `rep-${Date.now()}`,
            date: now,
            amount: remainingToSettle,
            note: 'Final full settlement',
          },
          ...currentRepayments,
        ]
      : currentRepayments;

    const updated: FriendBorrowing = {
      ...borrowing,
      amountBorrowed: 0,
      status: 'settled',
      lastUpdated: now,
      repayments: updatedRepayments,
    };

    onSave(updated);
    onClose();
  };

  const handleFullSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim()) return;

    const parsedCurrent = parseFloat(amountBorrowed) || 0;
    const parsedOriginal = parseFloat(originalAmount) || parsedCurrent;
    const now = new Date().toISOString().split('T')[0];

    let status: 'active' | 'partial' | 'settled' = 'active';
    if (parsedCurrent <= 0) {
      status = 'settled';
    } else if (parsedCurrent < parsedOriginal) {
      status = 'partial';
    }

    const saved: FriendBorrowing = {
      id: borrowing ? borrowing.id : `fr-${Date.now()}`,
      friendName: friendName.trim(),
      amountBorrowed: Math.max(0, parsedCurrent),
      originalAmount: Math.max(0, parsedOriginal),
      borrowedDate: borrowedDate || now,
      expectedPaybackDate: expectedPaybackDate || undefined,
      status,
      notes: notes.trim() || undefined,
      phoneOrContact: phoneOrContact.trim() || undefined,
      lastUpdated: now,
      repayments: borrowing?.repayments || [],
    };

    onSave(saved);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-200 ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/80'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {isNew ? 'Add Friend Borrowing' : `Update Borrowing: ${borrowing?.friendName}`}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isNew
                  ? 'Track personal loans, repayment milestones, and payback dates'
                  : `Currently owed: ${formatCurrency(borrowing?.amountBorrowed || 0, currency)}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Tabs if editing existing */}
        {!isNew && (
          <div
            className={`flex border-b px-6 pt-2 gap-4 text-xs font-semibold ${
              isDark ? 'border-slate-800 bg-slate-950/30' : 'border-slate-200 bg-slate-50/40'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveTab('quick_action')}
              className={`pb-2.5 border-b-2 transition-colors ${
                activeTab === 'quick_action'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Repay / Update Balance
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('edit_details')}
              className={`pb-2.5 border-b-2 transition-colors ${
                activeTab === 'edit_details'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Edit Details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <History size={13} />
              <span>History ({borrowing?.repayments?.length || 0})</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!isNew && activeTab === 'quick_action' ? (
            <form onSubmit={handleQuickActionSubmit} className="space-y-4">
              {/* Current Standing Card */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <span className={`text-[11px] font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Remaining Amount Owed
                  </span>
                  <span className="text-xl font-bold font-mono-numbers text-amber-600 dark:text-amber-400">
                    {formatCurrency(currentBalance, currency)}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-[11px] font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Original Borrowed
                  </span>
                  <span className="text-xs font-mono font-semibold">
                    {formatCurrency(borrowing?.originalAmount || 0, currency)}
                  </span>
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                    {borrowing && borrowing.originalAmount > borrowing.amountBorrowed
                      ? `${formatCurrency(borrowing.originalAmount - borrowing.amountBorrowed, currency)} repaid`
                      : 'No repayments yet'}
                  </div>
                </div>
              </div>

              {/* Action Type Tabs */}
              <div>
                <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Select Update Action
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActionType('repay');
                      setActionAmount('');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                      actionType === 'repay'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : isDark
                        ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Record Repayment
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActionType('set_balance');
                      setActionAmount(currentBalance.toString());
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                      actionType === 'set_balance'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : isDark
                        ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Set New Balance
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setActionType('borrow_more');
                      setActionAmount('');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                      actionType === 'borrow_more'
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : isDark
                        ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Borrow More
                  </button>
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {actionType === 'repay' && 'Repayment Amount to Deduct'}
                  {actionType === 'set_balance' && 'New Remaining Balance'}
                  {actionType === 'borrow_more' && 'Additional Amount Borrowed'}
                </label>
                <div className="relative">
                  <span
                    className={`absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm ${
                      isDark ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {currency.symbol}
                  </span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    autoFocus
                    placeholder="0.00"
                    value={actionAmount}
                    onChange={(e) => setActionAmount(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-base font-mono-numbers focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Quick Repayment shortcuts */}
                {actionType === 'repay' && currentBalance > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setActionAmount(currentBalance.toString())}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                        isDark
                          ? 'border-slate-700 bg-slate-800 text-emerald-400 hover:bg-slate-700'
                          : 'border-slate-200 bg-slate-100 text-emerald-700 hover:bg-slate-200'
                      }`}
                    >
                      Full Settle ({formatCurrency(currentBalance, currency)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setActionAmount((currentBalance / 2).toFixed(2))}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                        isDark
                          ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'
                          : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      50% ({formatCurrency(currentBalance / 2, currency)})
                    </button>
                  </div>
                )}
              </div>

              {/* Note input for repayments */}
              {actionType === 'repay' && (
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Repayment Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sent via Cash App / Venmo / Cash"
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              )}

              {/* Projected outcome */}
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                  isDark ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                }`}
              >
                <span>Projected Remaining Balance:</span>
                <span className="text-sm font-bold font-mono-numbers">
                  {formatCurrency(getProjectedBalance(), currency)}
                </span>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2">
                {currentBalance > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkSettled}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800"
                  >
                    <CheckCircle2 size={14} />
                    <span>One-Click Mark Settled</span>
                  </button>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      isDark
                        ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/25 transition-all"
                  >
                    Confirm Update
                  </button>
                </div>
              </div>
            </form>
          ) : !isNew && activeTab === 'history' ? (
            /* Repayment History View */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200 dark:border-slate-800">
                <span>Repayment Logs</span>
                <span>
                  Total Repaid:{' '}
                  <strong className="font-mono text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(
                      (borrowing?.repayments || []).reduce((acc, r) => acc + r.amount, 0),
                      currency
                    )}
                  </strong>
                </span>
              </div>

              {(!borrowing?.repayments || borrowing.repayments.length === 0) ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No repayment history recorded yet. Use the "Repay / Update Balance" tab to log a repayment.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {borrowing.repayments.map((rep) => (
                    <div
                      key={rep.id}
                      className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold">{rep.note || 'Repayment'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{rep.date}</div>
                      </div>
                      <div className="text-sm font-bold font-mono-numbers text-emerald-600 dark:text-emerald-400">
                        -{formatCurrency(rep.amount, currency)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Full Edit / Add Friend Loan Form */
            <form onSubmit={handleFullSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Friend's Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Carter, Sarah"
                    value={friendName}
                    onChange={(e) => setFriendName(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Phone or Contact Handle
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +1 (555) 000-0000 or @handle"
                    value={phoneOrContact}
                    onChange={(e) => setPhoneOrContact(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Remaining Amount Owed *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                      {currency.symbol}
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      placeholder="0.00"
                      value={amountBorrowed}
                      onChange={(e) => {
                        setAmountBorrowed(e.target.value);
                        if (isNew) setOriginalAmount(e.target.value);
                      }}
                      className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs font-mono-numbers focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isDark
                          ? 'bg-slate-950 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Total Initially Borrowed *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                      {currency.symbol}
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      required
                      placeholder="0.00"
                      value={originalAmount}
                      onChange={(e) => setOriginalAmount(e.target.value)}
                      className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs font-mono-numbers focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                        isDark
                          ? 'bg-slate-950 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Date Borrowed
                  </label>
                  <input
                    type="date"
                    value={borrowedDate}
                    onChange={(e) => setBorrowedDate(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Expected Payback Date
                  </label>
                  <input
                    type="date"
                    value={expectedPaybackDate}
                    onChange={(e) => setExpectedPaybackDate(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Reason or Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Purpose (e.g. flight ticket, dinner split, emergency repair)..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Form Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                {!isNew && onDelete ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete borrowing record with ${borrowing.friendName}?`)) {
                        onDelete(borrowing.id);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>Delete Record</span>
                  </button>
                ) : (
                  <div />
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors ${
                      isDark
                        ? 'border-slate-700 text-slate-300 hover:bg-slate-800'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-500/25 transition-all"
                  >
                    {isNew ? 'Create Friend Loan' : 'Save Details'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
