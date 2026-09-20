import React from 'react';
import { SalaryConfig, CurrencyConfig } from '../types';
import { formatCurrency } from '../utils/currencies';
import {
  WalletCards,
  ArrowRight,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

interface DashboardSalaryWidgetProps {
  salaryConfig: SalaryConfig;
  currency: CurrencyConfig;
  onNavigateToSalary: () => void;
  theme?: 'dark' | 'light';
}

export const DashboardSalaryWidget: React.FC<DashboardSalaryWidgetProps> = ({
  salaryConfig,
  currency,
  onNavigateToSalary,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  const totalAllocatedPercentage = salaryConfig.sections.reduce(
    (sum, s) => sum + (Number(s.percentage) || 0),
    0
  );

  const totalAllocatedAmount = Math.round(
    (salaryConfig.amount * totalAllocatedPercentage) / 100
  );

  const remainingAmount = salaryConfig.amount - totalAllocatedAmount;
  const remainingPercentage = +(100 - totalAllocatedPercentage).toFixed(1);

  return (
    <div className="space-y-3">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className={`text-sm font-semibold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
            Salary & Budget Allocation
          </h3>
          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Configured take-home compensation and customized allocation envelopes
          </p>
        </div>

        <button
          onClick={onNavigateToSalary}
          className={`inline-flex items-center gap-1 text-xs font-semibold transition-colors ${
            isDark
              ? 'text-indigo-400 hover:text-indigo-300'
              : 'text-indigo-600 hover:text-indigo-700'
          }`}
        >
          <span>Manage Allocation</span>
          <ArrowRight size={13} />
        </button>
      </div>

      {/* Main Card */}
      <div
        className={`p-4 sm:p-5 rounded-xl border transition-all ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.2)]'
            : 'bg-white border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.02)]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b dark:border-slate-800/80">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {salaryConfig.title || 'Take-Home Pay'} ({salaryConfig.frequency})
              </span>
              <span className={`text-[11px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                • Payday: {salaryConfig.payday || '1st of month'}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
                {formatCurrency(salaryConfig.amount, currency)}
              </span>
            </div>
          </div>

          {/* Allocation Health Tag */}
          <div>
            {totalAllocatedPercentage === 100 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                <CheckCircle2 size={12} />
                <span>100% Fully Allocated</span>
              </span>
            ) : totalAllocatedPercentage < 100 ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
                <AlertTriangle size={12} />
                <span>{remainingPercentage}% Unassigned ({formatCurrency(remainingAmount, currency)})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25">
                <AlertTriangle size={12} />
                <span>Over-allocated by {+(totalAllocatedPercentage - 100).toFixed(1)}%</span>
              </span>
            )}
          </div>
        </div>

        {/* Visual Multi-Segment Bar */}
        <div className="py-3 space-y-1.5">
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
            {salaryConfig.sections.map((sec) => {
              const widthPct = Math.min(100, Math.max(0, sec.percentage));
              if (widthPct <= 0) return null;
              return (
                <div
                  key={sec.id}
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: sec.color || '#6366F1',
                  }}
                  title={`${sec.name}: ${sec.percentage}% (${formatCurrency(sec.amount, currency)})`}
                  className="h-full relative group transition-all duration-300"
                />
              );
            })}
            {remainingPercentage > 0 && (
              <div
                style={{ width: `${Math.min(100, remainingPercentage)}%` }}
                title={`Unallocated: ${remainingPercentage}%`}
                className="h-full bg-slate-200 dark:bg-slate-700/60"
              />
            )}
          </div>
        </div>

        {/* Top Allocation Envelopes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
          {salaryConfig.sections.slice(0, 6).map((sec) => (
            <div
              key={sec.id}
              className={`p-2 rounded-lg text-xs space-y-1 border ${
                isDark ? 'bg-slate-800/40 border-slate-800/80' : 'bg-slate-50 border-slate-100'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: sec.color || '#6366F1' }}
                />
                <span className={`font-semibold truncate text-[11px] ${isDark ? 'text-slate-200' : 'text-slate-800'}`} title={sec.name}>
                  {sec.name}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[11px] font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(sec.amount, currency)}
                </span>
                <span className={`text-[10px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {sec.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer link to customize */}
        <div className="mt-3 pt-3 border-t dark:border-slate-800/80 flex items-center justify-between text-xs">
          <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>
            {salaryConfig.sections.length} custom allocation sections defined
          </span>
          <button
            onClick={onNavigateToSalary}
            className={`font-semibold inline-flex items-center gap-1 ${
              isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'
            }`}
          >
            <Sliders size={13} />
            <span>Customize Amounts & Percentages</span>
          </button>
        </div>
      </div>
    </div>
  );
};
