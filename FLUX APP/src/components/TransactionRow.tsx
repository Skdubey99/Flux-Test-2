import React from 'react';
import { Transaction, CurrencyConfig } from '../types';
import { formatCurrency, formatDate } from '../utils/currencies';
import { ArrowUpRight, ArrowDownRight, Edit2, Trash2 } from 'lucide-react';

interface TransactionRowProps {
  transaction: Transaction;
  currency: CurrencyConfig;
  onEdit: (t: Transaction) => void;
  onDelete: (id: string | number) => void;
  compact?: boolean;
  theme?: 'dark' | 'light';
}

export const TransactionRow: React.FC<TransactionRowProps> = ({
  transaction,
  currency,
  onEdit,
  onDelete,
  compact = false,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';
  const isIncome = transaction.type === 'income';

  return (
    <div
      id={`transaction-row-${transaction.id}`}
      onClick={() => onEdit(transaction)}
      className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-lg border transition-all cursor-pointer select-none ${
        isDark
          ? 'hover:bg-slate-800/60 border-transparent hover:border-slate-700/60'
          : 'hover:bg-slate-50 border-transparent hover:border-slate-200/90'
      }`}
    >
      {/* Left: Direction indicator & details */}
      <div className="flex items-center gap-3 min-w-0 pr-2">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
            isIncome
              ? isDark
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:shadow-[0_0_12px_-2px_rgba(16,185,129,0.35)]'
                : 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : isDark
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 group-hover:shadow-[0_0_12px_-2px_rgba(251,113,133,0.35)]'
              : 'bg-rose-50 border-rose-200 text-rose-600'
          }`}
        >
          {isIncome ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-semibold tracking-tight transition-colors ${
                isDark
                  ? 'text-slate-200 group-hover:text-white'
                  : 'text-slate-900 group-hover:text-indigo-600'
              }`}
            >
              {transaction.category}
            </span>
            {transaction.account && !compact && (
              <span
                className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded border ${
                  isDark
                    ? 'bg-slate-800/80 text-slate-400 border-slate-700/50'
                    : 'bg-slate-100 text-slate-600 border-slate-200/80 font-medium'
                }`}
              >
                {transaction.account}
              </span>
            )}
          </div>
          <p
            className={`text-xs truncate max-w-[200px] sm:max-w-xs md:max-w-md ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            {transaction.note || 'No note attached'}
          </p>
        </div>
      </div>

      {/* Right: Amount, Date, & Quick Actions */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div
            className={`text-sm sm:text-base font-semibold font-mono-numbers tracking-tight ${
              isIncome
                ? isDark
                  ? 'text-emerald-400'
                  : 'text-emerald-600'
                : isDark
                ? 'text-rose-400'
                : 'text-rose-600'
            }`}
          >
            {isIncome ? '+' : '-'}
            {formatCurrency(transaction.amount, currency)}
          </div>
          <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {formatDate(transaction.date)}
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            id={`txn-edit-btn-${transaction.id}`}
            title="Edit entry"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(transaction);
            }}
            className={`p-1 rounded-md transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-indigo-300 hover:bg-slate-700/60'
                : 'text-slate-400 hover:text-indigo-600 hover:bg-slate-100'
            }`}
          >
            <Edit2 size={13} />
          </button>
          <button
            id={`txn-delete-btn-${transaction.id}`}
            title="Delete entry"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(transaction.id);
            }}
            className={`p-1 rounded-md transition-colors ${
              isDark
                ? 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                : 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
            }`}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
};
