import React from 'react';
import { Transaction, CurrencyConfig } from '../types';
import { formatCurrency } from '../utils/currencies';
import { CATEGORIES } from '../data/defaultTransactions';
import { PieChart } from 'lucide-react';

interface CategoryBreakdownProps {
  transactions: Transaction[];
  currency: CurrencyConfig;
  theme?: 'dark' | 'light';
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({ transactions, currency, theme = 'light' }) => {
  const isDark = theme === 'dark';
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

  const categoryTotals = CATEGORIES.map((cat) => {
    const sum = expenseTransactions
      .filter((t) => t.category.toLowerCase() === cat.name.toLowerCase())
      .reduce((acc, t) => acc + t.amount, 0);
    const percentage = totalExpense > 0 ? (sum / totalExpense) * 100 : 0;
    return {
      ...cat,
      amount: sum,
      percentage,
    };
  })
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount);

  return (
    <div
      className={`card rounded-xl p-5 transition-colors duration-200 ${
        isDark
          ? 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm'
          : 'bg-white border border-slate-200/90 shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div
            className={`w-6 h-6 rounded-md flex items-center justify-center border ${
              isDark
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                : 'bg-indigo-50 border-indigo-200 text-indigo-600'
            }`}
          >
            <PieChart size={14} />
          </div>
          <h3 className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
            Expense Allocation
          </h3>
        </div>
        <span className={`text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {categoryTotals.length} categories
        </span>
      </div>

      {categoryTotals.length === 0 ? (
        <p className={`text-xs py-6 text-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
          No expense entries to analyze.
        </p>
      ) : (
        <div className="space-y-3">
          {categoryTotals.slice(0, 5).map((item) => (
            <div key={item.name} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono-numbers">
                  <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {item.percentage.toFixed(1)}%
                  </span>
                  <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                    {formatCurrency(item.amount, currency)}
                  </span>
                </div>
              </div>

              {/* Progress track */}
              <div
                className={`w-full h-1.5 rounded-full overflow-hidden border ${
                  isDark
                    ? 'bg-slate-950 border-slate-800/80'
                    : 'bg-slate-100 border-slate-200/80'
                }`}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
