import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, CurrencyConfig } from '../types';
import { CATEGORIES } from '../data/defaultTransactions';
import { X, ArrowUpRight, ArrowDownRight, Trash2, Check, Calendar, Tag, CreditCard, AlignLeft } from 'lucide-react';

interface TransactionModalProps {
  initialTransaction: Transaction | null;
  currency: CurrencyConfig;
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id'> & { id?: string | number }) => void;
  onDelete: (id: string | number) => void;
  theme?: 'dark' | 'light';
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  initialTransaction,
  currency,
  isOpen,
  onClose,
  onSave,
  onDelete,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('Food');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [account, setAccount] = useState<string>('Primary Checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTransaction) {
      setType(initialTransaction.type);
      setAmount(initialTransaction.amount.toString());
      setCategory(initialTransaction.category);
      setNote(initialTransaction.note || '');
      setDate(initialTransaction.date);
      setAccount(initialTransaction.account || 'Primary Checking');
    } else {
      setType('expense');
      setAmount('');
      setCategory('Food');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      setAccount('Primary Checking');
    }
    setError(null);
  }, [initialTransaction, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    onSave({
      ...(initialTransaction ? { id: initialTransaction.id } : {}),
      type,
      amount: numAmount,
      category,
      note: note.trim(),
      date,
      account,
    });
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn ${
        isDark ? 'bg-slate-950/80' : 'bg-slate-900/40'
      }`}
      onClick={onClose}
    >
      <div
        id="transaction-modal-card"
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-slideUp border ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50/80'
          }`}
        >
          <div>
            <h2 className={`text-lg font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {initialTransaction ? 'Edit Transaction' : 'Record Transaction'}
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {initialTransaction ? 'Modify existing ledger entry' : 'Log a new cash flow movement'}
            </p>
          </div>
          <button
            id="close-modal-btn"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-white hover:bg-slate-800'
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Segmented Type Switcher */}
          <div
            className={`grid grid-cols-2 gap-2 p-1 rounded-xl border ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              type="button"
              id="type-expense-btn"
              onClick={() => {
                setType('expense');
                if (category === 'Salary') setCategory('Food');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                type === 'expense'
                  ? isDark
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_15px_-3px_rgba(251,113,133,0.3)]'
                    : 'bg-white text-rose-700 border border-rose-200 shadow-sm font-bold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ArrowDownRight size={16} className={type === 'expense' ? 'text-rose-500' : ''} />
              Expense
            </button>

            <button
              type="button"
              id="type-income-btn"
              onClick={() => {
                setType('income');
                if (category === 'Food' || category === 'Rent') setCategory('Salary');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                type === 'income'
                  ? isDark
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]'
                    : 'bg-white text-emerald-700 border border-emerald-200 shadow-sm font-bold'
                  : isDark
                  ? 'text-slate-400 hover:text-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ArrowUpRight size={16} className={type === 'income' ? 'text-emerald-500' : ''} />
              Income
            </button>
          </div>

          {/* Amount input with large numeric display */}
          <div>
            <label
              className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Amount
            </label>
            <div className="relative flex items-center">
              <span className={`absolute left-4 text-xl font-mono select-none ${isDark ? 'text-slate-400' : 'text-slate-400'}`}>
                {currency.symbol}
              </span>
              <input
                id="txn-amount-input"
                type="number"
                step="any"
                required
                autoFocus
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 rounded-xl font-mono-numbers text-2xl font-bold tracking-tight focus:outline-none transition-all ${
                  isDark
                    ? `bg-slate-950 text-white placeholder-slate-600 ${
                        type === 'income'
                          ? 'border-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border-slate-800 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      }`
                    : `bg-slate-50 text-slate-900 placeholder-slate-400 focus:bg-white ${
                        type === 'income'
                          ? 'border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                          : 'border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
                      }`
                }`}
              />
            </div>
            {error && <p className="text-xs text-rose-500 mt-1">{error}</p>}
          </div>

          {/* Category and Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <Tag size={13} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                Category
              </label>
              <select
                id="txn-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  isDark
                    ? 'bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-indigo-500 focus:bg-white'
                }`}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <Calendar size={13} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                Date
              </label>
              <input
                id="txn-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  isDark
                    ? 'bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-indigo-500 focus:bg-white'
                }`}
              />
            </div>
          </div>

          {/* Account and Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <CreditCard size={13} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                Account
              </label>
              <select
                id="txn-account-select"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  isDark
                    ? 'bg-slate-950 border border-slate-800 text-slate-200 focus:border-indigo-500'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-indigo-500 focus:bg-white'
                }`}
              >
                <option value="Primary Checking">Primary Checking</option>
                <option value="Neon Credit Card">Neon Credit Card</option>
                <option value="High-Yield Savings">High-Yield Savings</option>
                <option value="Zerodha / Demat">Zerodha / Demat</option>
                <option value="Cash Reserve">Cash Reserve</option>
              </select>
            </div>

            <div>
              <label
                className={`flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-1.5 ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                <AlignLeft size={13} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
                Description / Memo
              </label>
              <input
                id="txn-note-input"
                type="text"
                placeholder="Optional description"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  isDark
                    ? 'bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-600 focus:border-indigo-500'
                    : 'bg-slate-50 border border-slate-200 text-slate-800 focus:border-indigo-500 focus:bg-white'
                }`}
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className={`flex items-center justify-between pt-4 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            {initialTransaction ? (
              <button
                type="button"
                id="delete-txn-confirm-btn"
                onClick={() => {
                  if (confirm('Delete this ledger entry?')) {
                    onDelete(initialTransaction.id);
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 size={15} />
                Delete
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                id="cancel-modal-btn"
                onClick={onClose}
                className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
                  isDark
                    ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                id="save-txn-submit-btn"
                className={`flex items-center gap-1.5 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white rounded-lg shadow transition-all ${
                  type === 'income'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                <Check size={14} />
                {initialTransaction ? 'Save Changes' : 'Record Entry'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
