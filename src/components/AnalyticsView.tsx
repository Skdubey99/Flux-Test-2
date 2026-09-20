import React from 'react';
import { Transaction, CurrencyConfig } from '../types';
import { formatCurrency } from '../utils/currencies';
import { CashFlowChart } from './CashFlowChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { Target, Wallet, Zap, CalendarDays, TrendingDown } from 'lucide-react';

interface AnalyticsViewProps {
  transactions: Transaction[];
  currency: CurrencyConfig;
  theme?: 'dark' | 'light';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ transactions, currency, theme = 'light' }) => {
  const isDark = theme === 'dark';
  const incomeTxns = transactions.filter((t) => t.type === 'income');
  const expenseTxns = transactions.filter((t) => t.type === 'expense');

  const totalIncome = incomeTxns.reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = expenseTxns.reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, ((totalIncome - totalExpense) / totalIncome) * 100) : 0;

  const maxExpense = expenseTxns.length > 0 ? Math.max(...expenseTxns.map((t) => t.amount)) : 0;
  const avgExpense = expenseTxns.length > 0 ? totalExpense / expenseTxns.length : 0;

  return (
    <div className="space-y-6">
      {/* Top Velocity KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className={`card rounded-xl p-4 relative overflow-hidden transition-colors duration-200 ${
            isDark
              ? 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm'
              : 'bg-white border border-slate-200/90 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase font-semibold tracking-wider text-[11px]">Net Capital</span>
            <Wallet size={15} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
          </div>
          <div
            className={`text-2xl font-bold font-mono-numbers ${
              netBalance >= 0
                ? isDark
                  ? 'text-emerald-400'
                  : 'text-emerald-600'
                : isDark
                ? 'text-rose-400'
                : 'text-rose-600'
            }`}
          >
            {formatCurrency(netBalance, currency)}
          </div>
          <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Cumulative standing
          </span>
        </div>

        <div
          className={`card rounded-xl p-4 relative overflow-hidden transition-colors duration-200 ${
            isDark
              ? 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm'
              : 'bg-white border border-slate-200/90 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase font-semibold tracking-wider text-[11px]">Savings Rate</span>
            <Target size={15} className={isDark ? 'text-emerald-400' : 'text-emerald-600'} />
          </div>
          <div
            className={`text-2xl font-bold font-mono-numbers ${
              isDark ? 'text-emerald-400' : 'text-emerald-600'
            }`}
          >
            {savingsRate.toFixed(1)}%
          </div>
          <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Of gross inflow retained
          </span>
        </div>

        <div
          className={`card rounded-xl p-4 relative overflow-hidden transition-colors duration-200 ${
            isDark
              ? 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm'
              : 'bg-white border border-slate-200/90 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase font-semibold tracking-wider text-[11px]">Avg Transaction</span>
            <TrendingDown size={15} className={isDark ? 'text-rose-400' : 'text-rose-600'} />
          </div>
          <div
            className={`text-2xl font-bold font-mono-numbers ${
              isDark ? 'text-slate-200' : 'text-slate-900'
            }`}
          >
            {formatCurrency(avgExpense, currency)}
          </div>
          <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Per expense occurrence
          </span>
        </div>

        <div
          className={`card rounded-xl p-4 relative overflow-hidden transition-colors duration-200 ${
            isDark
              ? 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm'
              : 'bg-white border border-slate-200/90 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="uppercase font-semibold tracking-wider text-[11px]">Peak Single Outflow</span>
            <Zap size={15} className={isDark ? 'text-indigo-400' : 'text-indigo-600'} />
          </div>
          <div
            className={`text-2xl font-bold font-mono-numbers ${
              isDark ? 'text-rose-400' : 'text-rose-600'
            }`}
          >
            {formatCurrency(maxExpense, currency)}
          </div>
          <span className={`text-[11px] mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            Max individual deduction
          </span>
        </div>
      </div>

      {/* Main Chart */}
      <CashFlowChart transactions={transactions} currency={currency} theme={theme} />

      {/* Two Column Layout: Allocation breakdown & Account breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryBreakdown transactions={transactions} currency={currency} theme={theme} />

        {/* Financial Flow Distribution */}
        <div
          className={`card rounded-xl p-5 space-y-4 transition-colors duration-200 ${
            isDark
              ? 'bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm'
              : 'bg-white border border-slate-200/90 shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-md flex items-center justify-center border ${
                  isDark
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-600'
                }`}
              >
                <CalendarDays size={14} />
              </div>
              <h3 className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                Inflow vs Outflow Ratio
              </h3>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className={`font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  Inflow (Gross Income)
                </span>
                <span className={`font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {totalIncome > 0 ? ((totalIncome / (totalIncome + totalExpense || 1)) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div
                className={`h-3 w-full rounded-full overflow-hidden border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: `${totalIncome > 0 ? (totalIncome / (totalIncome + totalExpense || 1)) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className={`font-medium ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                  Outflow (Gross Expenses)
                </span>
                <span className={`font-mono ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                  {totalExpense > 0 ? ((totalExpense / (totalIncome + totalExpense || 1)) * 100).toFixed(0) : 0}%
                </span>
              </div>
              <div
                className={`h-3 w-full rounded-full overflow-hidden border ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                }`}
              >
                <div
                  className="h-full bg-rose-500 transition-all duration-500"
                  style={{
                    width: `${totalExpense > 0 ? (totalExpense / (totalIncome + totalExpense || 1)) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div
            className={`p-3.5 mt-4 rounded-lg border text-xs space-y-1 ${
              isDark
                ? 'bg-slate-950/70 border-slate-800 text-slate-400'
                : 'bg-slate-50 border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex justify-between">
              <span>Total Transactions:</span>
              <span className={`font-mono font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                {transactions.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Income Events:</span>
              <span className={`font-mono font-semibold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                {incomeTxns.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Expense Deductions:</span>
              <span className={`font-mono font-semibold ${isDark ? 'text-rose-400' : 'text-rose-600'}`}>
                {expenseTxns.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
