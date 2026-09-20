import React, { useState, useEffect } from 'react';
import { CreditCardBorrowing, CurrencyConfig } from '../types';
import { formatCurrency } from '../utils/currencies';
import {
  CreditCard,
  X,
  Plus,
  Minus,
  Check,
  Calendar,
  AlertCircle,
  Building2,
  Trash2,
} from 'lucide-react';

interface UpdateCreditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: CreditCardBorrowing | null; // null means adding new card
  currency: CurrencyConfig;
  onSave: (card: CreditCardBorrowing) => void;
  onDelete?: (id: string | number) => void;
  theme?: 'dark' | 'light';
}

type UpdateMode = 'set_balance' | 'add_charge' | 'pay_balance';

export const UpdateCreditCardModal: React.FC<UpdateCreditCardModalProps> = ({
  isOpen,
  onClose,
  card,
  currency,
  onSave,
  onDelete,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  // Mode: if editing existing card, offer quick balance update mode vs full edit
  const [activeTab, setActiveTab] = useState<'quick_balance' | 'edit_details'>('quick_balance');
  const [updateMode, setUpdateMode] = useState<UpdateMode>('set_balance');
  const [adjustmentAmount, setAdjustmentAmount] = useState<string>('');

  // Card fields
  const [cardName, setCardName] = useState('');
  const [bankOrIssuer, setBankOrIssuer] = useState('');
  const [amountBorrowed, setAmountBorrowed] = useState<string>('0');
  const [creditLimit, setCreditLimit] = useState<string>('');
  const [billingDueDate, setBillingDueDate] = useState('');
  const [apr, setApr] = useState<string>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (card) {
      setCardName(card.cardName);
      setBankOrIssuer(card.bankOrIssuer);
      setAmountBorrowed(card.amountBorrowed.toString());
      setCreditLimit(card.creditLimit ? card.creditLimit.toString() : '');
      setBillingDueDate(card.billingDueDate || '');
      setApr(card.apr ? card.apr.toString() : '');
      setNotes(card.notes || '');
      setActiveTab('quick_balance');
      setUpdateMode('set_balance');
      setAdjustmentAmount('');
    } else {
      // Adding new
      setCardName('');
      setBankOrIssuer('');
      setAmountBorrowed('0');
      setCreditLimit('');
      setBillingDueDate('');
      setApr('');
      setNotes('');
      setActiveTab('edit_details');
      setAdjustmentAmount('');
    }
  }, [card, isOpen]);

  if (!isOpen) return null;

  const currentBalance = card ? card.amountBorrowed : parseFloat(amountBorrowed) || 0;

  // Calculate new balance based on quick adjustment
  const calculateAdjustedBalance = (): number => {
    const adj = parseFloat(adjustmentAmount) || 0;
    if (updateMode === 'set_balance') {
      return adj;
    } else if (updateMode === 'add_charge') {
      return currentBalance + adj;
    } else if (updateMode === 'pay_balance') {
      return Math.max(0, currentBalance - adj);
    }
    return currentBalance;
  };

  const handleQuickBalanceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!card) return;

    const newBalance = calculateAdjustedBalance();
    const updatedCard: CreditCardBorrowing = {
      ...card,
      amountBorrowed: newBalance,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    onSave(updatedCard);
    onClose();
  };

  const handleFullSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardName.trim()) return;

    const now = new Date().toISOString().split('T')[0];
    const parsedAmount = parseFloat(amountBorrowed) || 0;

    const savedCard: CreditCardBorrowing = {
      id: card ? card.id : `cc-${Date.now()}`,
      cardName: cardName.trim(),
      bankOrIssuer: bankOrIssuer.trim() || 'General Credit',
      amountBorrowed: Math.max(0, parsedAmount),
      creditLimit: creditLimit ? Math.max(0, parseFloat(creditLimit)) : undefined,
      billingDueDate: billingDueDate || undefined,
      apr: apr ? parseFloat(apr) : undefined,
      notes: notes.trim() || undefined,
      lastUpdated: now,
    };

    onSave(savedCard);
    onClose();
  };

  const isNew = !card;

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
                isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <CreditCard size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {isNew ? 'Add Credit Card Borrowing' : `Update: ${card?.cardName}`}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {isNew
                  ? 'Track borrowed balance, limit, and billing cycle'
                  : `Currently borrowed: ${formatCurrency(card?.amountBorrowed || 0, currency)}`}
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

        {/* Modal Tabs if editing existing card */}
        {!isNew && (
          <div
            className={`flex border-b px-6 pt-2 gap-4 text-xs font-semibold ${
              isDark ? 'border-slate-800 bg-slate-950/30' : 'border-slate-200 bg-slate-50/40'
            }`}
          >
            <button
              type="button"
              onClick={() => setActiveTab('quick_balance')}
              className={`pb-2.5 border-b-2 transition-colors ${
                activeTab === 'quick_balance'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Update Borrowed Amount
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('edit_details')}
              className={`pb-2.5 border-b-2 transition-colors ${
                activeTab === 'edit_details'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : isDark
                  ? 'border-transparent text-slate-400 hover:text-slate-200'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              Edit Card Details
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {!isNew && activeTab === 'quick_balance' ? (
            <form onSubmit={handleQuickBalanceSubmit} className="space-y-5">
              {/* Current Status banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div>
                  <span className={`text-[11px] font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Current Amount Borrowed
                  </span>
                  <span className="text-xl font-bold font-mono-numbers text-rose-600 dark:text-rose-400">
                    {formatCurrency(currentBalance, currency)}
                  </span>
                </div>
                {card?.creditLimit && (
                  <div className="text-right">
                    <span className={`text-[11px] font-medium block ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      Credit Limit
                    </span>
                    <span className="text-xs font-mono font-semibold">
                      {formatCurrency(card.creditLimit, currency)}
                    </span>
                  </div>
                )}
              </div>

              {/* Mode Selector */}
              <div>
                <label className={`block text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Action Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setUpdateMode('set_balance');
                      setAdjustmentAmount(currentBalance.toString());
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                      updateMode === 'set_balance'
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
                      setUpdateMode('pay_balance');
                      setAdjustmentAmount('');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                      updateMode === 'pay_balance'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : isDark
                        ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Pay Back / Reduce
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUpdateMode('add_charge');
                      setAdjustmentAmount('');
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all text-center ${
                      updateMode === 'add_charge'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : isDark
                        ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    Add Borrowing
                  </button>
                </div>
              </div>

              {/* Amount input */}
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {updateMode === 'set_balance' && 'New Total Borrowed Balance'}
                  {updateMode === 'pay_balance' && 'Payment Amount to Deduct'}
                  {updateMode === 'add_charge' && 'New Swipe / Borrowed Amount to Add'}
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
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-base font-mono-numbers focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Quick preset buttons if paying */}
                {updateMode === 'pay_balance' && currentBalance > 0 && (
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setAdjustmentAmount(currentBalance.toString())}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                        isDark
                          ? 'border-slate-700 bg-slate-800 text-emerald-400 hover:bg-slate-700'
                          : 'border-slate-200 bg-slate-100 text-emerald-700 hover:bg-slate-200'
                      }`}
                    >
                      Pay Full ({formatCurrency(currentBalance, currency)})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustmentAmount((currentBalance / 2).toFixed(2))}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                        isDark
                          ? 'border-slate-700 bg-slate-800 text-indigo-300 hover:bg-slate-700'
                          : 'border-slate-200 bg-slate-100 text-indigo-700 hover:bg-slate-200'
                      }`}
                    >
                      Pay 50% ({formatCurrency(currentBalance / 2, currency)})
                    </button>
                  </div>
                )}
              </div>

              {/* Result Preview */}
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                  isDark ? 'bg-indigo-950/20 border-indigo-900/40 text-indigo-300' : 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
                }`}
              >
                <span>Projected Borrowed Balance:</span>
                <span className="text-sm font-bold font-mono-numbers">
                  {formatCurrency(calculateAdjustedBalance(), currency)}
                </span>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
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
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all"
                >
                  Update Balance
                </button>
              </div>
            </form>
          ) : (
            /* Full Edit / Add Form */
            <form onSubmit={handleFullSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Card Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sapphire Reserve"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Bank / Card Issuer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Chase, Amex, HDFC"
                    value={bankOrIssuer}
                    onChange={(e) => setBankOrIssuer(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
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
                    Current Amount Borrowed *
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
                      onChange={(e) => setAmountBorrowed(e.target.value)}
                      className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs font-mono-numbers focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                        isDark
                          ? 'bg-slate-950 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Credit Limit (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                      {currency.symbol}
                    </span>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="e.g. 10000"
                      value={creditLimit}
                      onChange={(e) => setCreditLimit(e.target.value)}
                      className={`w-full pl-8 pr-3 py-2 rounded-xl border text-xs font-mono-numbers focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
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
                    Billing / Due Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={billingDueDate}
                    onChange={(e) => setBillingDueDate(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Interest Rate / APR % (Optional)
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    placeholder="e.g. 21.99"
                    value={apr}
                    onChange={(e) => setApr(e.target.value)}
                    className={`w-full px-3.5 py-2 rounded-xl border text-xs font-mono-numbers focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-white'
                        : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Notes & Details
                </label>
                <textarea
                  rows={2}
                  placeholder="Auto-pay setup, perks, statement cycle dates..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={`w-full px-3.5 py-2 rounded-xl border text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none ${
                    isDark
                      ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                {!isNew && onDelete ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete credit card record "${card.cardName}"?`)) {
                        onDelete(card.id);
                        onClose();
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>Delete Card</span>
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
                    className="px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/25 transition-all"
                  >
                    {isNew ? 'Create Credit Card' : 'Save Details'}
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
