import React, { useState, useMemo } from 'react';
import { SalaryConfig, SalaryAllocationSection, CurrencyConfig, Transaction, SalaryFrequency } from '../types';
import { formatCurrency } from '../utils/currencies';
import { SALARY_PRESETS } from '../data/defaultSalary';
import {
  WalletCards,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  DollarSign,
  ArrowUpRight,
  RefreshCw,
  Sparkles,
  PieChart,
  Calendar,
  Layers,
  Check,
  Percent,
  TrendingDown,
  Info,
  ChevronDown,
} from 'lucide-react';

interface SalaryAllocationViewProps {
  salaryConfig: SalaryConfig;
  onUpdateSalaryConfig: (config: SalaryConfig) => void;
  currency: CurrencyConfig;
  transactions: Transaction[];
  onAddTransaction: (txn: Omit<Transaction, 'id'>) => void;
  theme?: 'dark' | 'light';
}

const COLOR_PALETTE = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#6366F1', // Indigo
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#EF4444', // Red
  '#14B8A6', // Teal
  '#F97316', // Orange
];

const CATEGORY_OPTIONS = [
  'General',
  'Rent',
  'Housing',
  'Food',
  'Groceries',
  'Utilities',
  'Transport',
  'Debt',
  'Savings',
  'Investment',
  'Entertainment',
  'Health',
  'Shopping',
  'Education',
  'Personal',
  'Other',
];

export const SalaryAllocationView: React.FC<SalaryAllocationViewProps> = ({
  salaryConfig,
  onUpdateSalaryConfig,
  currency,
  transactions,
  onAddTransaction,
  theme = 'light',
}) => {
  const isDark = theme === 'dark';

  // State for Editing Salary Base Amount / Frequency
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState<string>(String(salaryConfig.amount));
  const [frequencyInput, setFrequencyInput] = useState<SalaryFrequency>(salaryConfig.frequency);
  const [titleInput, setTitleInput] = useState<string>(salaryConfig.title || 'Primary Income');
  const [paydayInput, setPaydayInput] = useState<string>(salaryConfig.payday || '1st of the month');

  // State for Section Modal / Form (Add / Edit)
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | number | null>(null);
  const [sectionName, setSectionName] = useState('');
  const [sectionPercentage, setSectionPercentage] = useState<number>(10);
  const [sectionColor, setSectionColor] = useState(COLOR_PALETTE[0]);
  const [sectionCategory, setSectionCategory] = useState('General');
  const [sectionNotes, setSectionNotes] = useState('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Calculations
  const totalAllocatedPercentage = useMemo(() => {
    return salaryConfig.sections.reduce((sum, s) => sum + (Number(s.percentage) || 0), 0);
  }, [salaryConfig.sections]);

  const totalAllocatedAmount = useMemo(() => {
    return Math.round((salaryConfig.amount * totalAllocatedPercentage) / 100);
  }, [salaryConfig.amount, totalAllocatedPercentage]);

  const remainingAmount = salaryConfig.amount - totalAllocatedAmount;
  const remainingPercentage = +(100 - totalAllocatedPercentage).toFixed(1);

  // Calculate actual spending in current month matching category
  const currentMonthExpensesByCategory = useMemo(() => {
    const map: Record<string, number> = {};
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    transactions
      .filter((t) => t.type === 'expense')
      .forEach((t) => {
        try {
          const tDate = new Date(t.date + 'T00:00:00');
          if (tDate.getFullYear() === currentYear && tDate.getMonth() === currentMonth) {
            const cat = t.category.toLowerCase().trim();
            map[cat] = (map[cat] || 0) + Number(t.amount);
          }
        } catch {
          // ignore
        }
      });
    return map;
  }, [transactions]);

  // Save Salary Base Details
  const handleSaveSalaryDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(salaryInput);
    if (isNaN(num) || num <= 0) {
      alert('Please enter a valid salary amount greater than 0.');
      return;
    }

    // Recalculate amounts for each section based on new salary
    const updatedSections = salaryConfig.sections.map((sec) => ({
      ...sec,
      amount: Math.round((num * sec.percentage) / 100),
    }));

    onUpdateSalaryConfig({
      ...salaryConfig,
      amount: num,
      frequency: frequencyInput,
      title: titleInput.trim() || 'Primary Income',
      payday: paydayInput.trim() || '1st of the month',
      lastUpdated: new Date().toISOString().split('T')[0],
      sections: updatedSections,
    });

    setIsEditingSalary(false);
    triggerToast('Salary amount and schedule updated successfully.');
  };

  // Open Add Section Modal
  const handleOpenAddSection = () => {
    setEditingSectionId(null);
    setSectionName('');
    // Default to remaining percentage if between 1 and 50, else 10%
    const defaultPct = remainingPercentage > 0 && remainingPercentage <= 100 ? remainingPercentage : 10;
    setSectionPercentage(defaultPct);
    setSectionColor(COLOR_PALETTE[salaryConfig.sections.length % COLOR_PALETTE.length]);
    setSectionCategory('General');
    setSectionNotes('');
    setIsSectionModalOpen(true);
  };

  // Open Edit Section Modal
  const handleOpenEditSection = (sec: SalaryAllocationSection) => {
    setEditingSectionId(sec.id);
    setSectionName(sec.name);
    setSectionPercentage(sec.percentage);
    setSectionColor(sec.color || COLOR_PALETTE[0]);
    setSectionCategory(sec.categoryMatching || 'General');
    setSectionNotes(sec.notes || '');
    setIsSectionModalOpen(true);
  };

  // Save Section (Add or Update)
  const handleSaveSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionName.trim()) {
      alert('Please enter a name for this allocation section.');
      return;
    }

    const pct = parseFloat(String(sectionPercentage));
    if (isNaN(pct) || pct <= 0) {
      alert('Please enter a valid allocation percentage greater than 0.');
      return;
    }

    const allocatedAmount = Math.round((salaryConfig.amount * pct) / 100);

    let updatedSections: SalaryAllocationSection[];
    if (editingSectionId) {
      updatedSections = salaryConfig.sections.map((s) =>
        s.id === editingSectionId
          ? {
              ...s,
              name: sectionName.trim(),
              percentage: pct,
              amount: allocatedAmount,
              color: sectionColor,
              categoryMatching: sectionCategory,
              notes: sectionNotes.trim(),
            }
          : s
      );
    } else {
      const newSection: SalaryAllocationSection = {
        id: `sec-${Date.now()}`,
        name: sectionName.trim(),
        percentage: pct,
        amount: allocatedAmount,
        color: sectionColor,
        categoryMatching: sectionCategory,
        notes: sectionNotes.trim(),
      };
      updatedSections = [...salaryConfig.sections, newSection];
    }

    onUpdateSalaryConfig({
      ...salaryConfig,
      lastUpdated: new Date().toISOString().split('T')[0],
      sections: updatedSections,
    });

    setIsSectionModalOpen(false);
    triggerToast(editingSectionId ? 'Allocation section updated.' : 'New allocation section created.');
  };

  // Delete Section
  const handleDeleteSection = (id: string | number) => {
    const sec = salaryConfig.sections.find((s) => s.id === id);
    if (!sec) return;
    if (confirm(`Remove allocation section "${sec.name}"?`)) {
      const updated = salaryConfig.sections.filter((s) => s.id !== id);
      onUpdateSalaryConfig({
        ...salaryConfig,
        lastUpdated: new Date().toISOString().split('T')[0],
        sections: updated,
      });
      triggerToast(`Removed "${sec.name}" section.`);
    }
  };

  // Fluid slider update for a section percentage
  const handleSliderPercentageChange = (id: string | number, newPct: number) => {
    const pct = Math.max(0, Math.min(100, Math.round(newPct)));
    const updated = salaryConfig.sections.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          percentage: pct,
          amount: Math.round((salaryConfig.amount * pct) / 100),
        };
      }
      return s;
    });
    onUpdateSalaryConfig({
      ...salaryConfig,
      sections: updated,
    });
  };

  // Fluid amount update for a section
  const handleAmountChange = (id: string | number, newAmount: number) => {
    const amount = Math.max(0, newAmount);
    const pct = salaryConfig.amount > 0 ? +(amount / salaryConfig.amount * 100).toFixed(1) : 0;
    const updated = salaryConfig.sections.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          amount,
          percentage: pct,
        };
      }
      return s;
    });
    onUpdateSalaryConfig({
      ...salaryConfig,
      sections: updated,
    });
  };

  // Apply Preset
  const handleApplyPreset = (presetId: string) => {
    const preset = SALARY_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    if (confirm(`Apply "${preset.name}" allocation model? This will replace your current allocation sections.`)) {
      const newSections: SalaryAllocationSection[] = preset.sections.map((sec, idx) => ({
        id: `preset-${Date.now()}-${idx}`,
        name: sec.name,
        percentage: sec.percentage,
        amount: Math.round((salaryConfig.amount * sec.percentage) / 100),
        color: sec.color,
        categoryMatching: sec.categoryMatching,
        notes: sec.notes,
      }));

      onUpdateSalaryConfig({
        ...salaryConfig,
        lastUpdated: new Date().toISOString().split('T')[0],
        sections: newSections,
      });
      triggerToast(`Applied "${preset.name}" allocation preset.`);
    }
  };

  // Auto-balance remaining into a specific section or evenly
  const handleAutoBalance = () => {
    if (remainingPercentage === 0) return;
    if (salaryConfig.sections.length === 0) return;

    // Distribute remainder proportionally or add to the highest savings/investment section
    const targetSection =
      salaryConfig.sections.find((s) => s.categoryMatching === 'Savings' || s.name.toLowerCase().includes('savings')) ||
      salaryConfig.sections[0];

    const updated = salaryConfig.sections.map((s) => {
      if (s.id === targetSection.id) {
        const newPct = +(s.percentage + remainingPercentage).toFixed(1);
        return {
          ...s,
          percentage: newPct,
          amount: Math.round((salaryConfig.amount * newPct) / 100),
        };
      }
      return s;
    });

    onUpdateSalaryConfig({
      ...salaryConfig,
      sections: updated,
    });
    triggerToast(`Allocated remaining balance to "${targetSection.name}".`);
  };

  // Record Salary to Ledger as Income
  const handleRecordSalaryToLedger = () => {
    const today = new Date().toISOString().split('T')[0];
    onAddTransaction({
      type: 'income',
      amount: salaryConfig.amount,
      category: 'Salary',
      note: `${salaryConfig.title || 'Salary'} (${salaryConfig.frequency.toUpperCase()} compensation)`,
      date: today,
      account: 'Primary Checking',
    });
    triggerToast(`Deposited ${formatCurrency(salaryConfig.amount, currency)} salary payment into ledger!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Check size={14} className="text-emerald-500 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Salary Header Card */}
      <div
        className={`p-5 sm:p-6 rounded-2xl border transition-all ${
          isDark
            ? 'bg-slate-900/90 border-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
            : 'bg-white border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          {/* Salary Amount Display */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider ${
                  isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700'
                }`}
              >
                <WalletCards size={13} />
                <span>{salaryConfig.frequency} Income</span>
              </span>
              <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                • Payday: <strong className={isDark ? 'text-slate-200' : 'text-slate-700'}>{salaryConfig.payday || '1st of month'}</strong>
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-slate-900 dark:text-white">
                {formatCurrency(salaryConfig.amount, currency)}
              </h2>
              <span className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {salaryConfig.title || 'Net Take-Home Salary'}
              </span>
            </div>

            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Decide and customize how your income is divided across needs, investments, debts, and lifestyle.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              id="salary-edit-btn"
              onClick={() => {
                setSalaryInput(String(salaryConfig.amount));
                setFrequencyInput(salaryConfig.frequency);
                setTitleInput(salaryConfig.title || 'Primary Income');
                setPaydayInput(salaryConfig.payday || '1st of the month');
                setIsEditingSalary(true);
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isDark
                  ? 'bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-slate-200'
                  : 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700'
              }`}
            >
              <Edit2 size={14} />
              <span>Update Salary</span>
            </button>

            <button
              id="salary-add-section-btn"
              onClick={handleOpenAddSection}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30 transition-all active:scale-[0.98]"
            >
              <Plus size={15} />
              <span>Add Custom Section</span>
            </button>

            <button
              id="salary-deposit-ledger-btn"
              onClick={handleRecordSalaryToLedger}
              title="Record this paycheck as an Income transaction in the ledger"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                isDark
                  ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/30 text-emerald-300'
                  : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700'
              }`}
            >
              <ArrowUpRight size={14} />
              <span>Deposit to Ledger</span>
            </button>
          </div>
        </div>

        {/* Inline Edit Form for Base Salary */}
        {isEditingSalary && (
          <form
            onSubmit={handleSaveSalaryDetails}
            className={`mt-5 pt-5 border-t space-y-4 animate-fadeIn ${
              isDark ? 'border-slate-800' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-500 dark:text-indigo-400 flex items-center gap-1.5">
                <Sliders size={14} />
                <span>Configure Salary Amount & Schedule</span>
              </h4>
              <button
                type="button"
                onClick={() => setIsEditingSalary(false)}
                className={`text-xs ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Salary Amount */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Salary Amount ({currency.symbol})
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-2.5 text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {currency.symbol}
                  </span>
                  <input
                    type="number"
                    step="any"
                    value={salaryInput}
                    onChange={(e) => setSalaryInput(e.target.value)}
                    required
                    className={`w-full pl-8 pr-3 py-2 rounded-lg text-xs font-mono font-semibold border transition-all ${
                      isDark
                        ? 'bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500'
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                    }`}
                  />
                </div>
              </div>

              {/* Pay Frequency */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Frequency
                </label>
                <select
                  value={frequencyInput}
                  onChange={(e) => setFrequencyInput(e.target.value as SalaryFrequency)}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                  }`}
                >
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Bi-Weekly (Every 2 Weeks)</option>
                  <option value="weekly">Weekly</option>
                  <option value="annual">Annual</option>
                </select>
              </div>

              {/* Payday Description */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Payday Schedule
                </label>
                <input
                  type="text"
                  value={paydayInput}
                  onChange={(e) => setPaydayInput(e.target.value)}
                  placeholder="e.g. 1st of every month"
                  className={`w-full px-3 py-2 rounded-lg text-xs border transition-all ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                  }`}
                />
              </div>

              {/* Title / Label */}
              <div>
                <label className={`block text-xs font-medium mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Income Label
                </label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="e.g. Primary Job Salary"
                  className={`w-full px-3 py-2 rounded-lg text-xs border transition-all ${
                    isDark
                      ? 'bg-slate-800/80 border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsEditingSalary(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                Close
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Allocation Overview Stats & Segmented Bar */}
      <div
        className={`p-5 rounded-2xl border transition-all space-y-4 ${
          isDark
            ? 'bg-slate-900/90 border-slate-800'
            : 'bg-white border-slate-200/90 shadow-[0_2px_12px_rgba(0,0,0,0.02)]'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className={`text-sm font-semibold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Allocation Distribution & Health
              </h3>
              {totalAllocatedPercentage === 100 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={11} />
                  100% Fully Allocated
                </span>
              ) : totalAllocatedPercentage < 100 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <AlertTriangle size={11} />
                  {remainingPercentage}% Unallocated ({formatCurrency(remainingAmount, currency)})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  <AlertTriangle size={11} />
                  Over-allocated by {+(totalAllocatedPercentage - 100).toFixed(1)}% ({formatCurrency(Math.abs(remainingAmount), currency)})
                </span>
              )}
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Total Allocated: <strong className="font-mono">{formatCurrency(totalAllocatedAmount, currency)}</strong> of{' '}
              <strong className="font-mono">{formatCurrency(salaryConfig.amount, currency)}</strong>
            </p>
          </div>

          {/* Quick Auto Balance Button if unallocated */}
          {remainingPercentage > 0 && salaryConfig.sections.length > 0 && (
            <button
              onClick={handleAutoBalance}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                isDark
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
                  : 'bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-800'
              }`}
            >
              <Sparkles size={13} className="text-amber-500" />
              <span>Balance Remaining ({remainingPercentage}%)</span>
            </button>
          )}
        </div>

        {/* Visual Segmented Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-4 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
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
                  className="h-full relative group transition-all duration-300 hover:opacity-90 cursor-pointer"
                />
              );
            })}
            {remainingPercentage > 0 && (
              <div
                style={{ width: `${Math.min(100, remainingPercentage)}%` }}
                title={`Unallocated: ${remainingPercentage}% (${formatCurrency(remainingAmount, currency)})`}
                className="h-full bg-slate-200 dark:bg-slate-700/60 transition-all duration-300"
              />
            )}
          </div>

          {/* Legend dots */}
          <div className="flex items-center gap-3 flex-wrap pt-1">
            {salaryConfig.sections.map((sec) => (
              <div key={sec.id} className="flex items-center gap-1.5 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: sec.color || '#6366F1' }}
                />
                <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {sec.name}
                </span>
                <span className={`font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  {sec.percentage}%
                </span>
              </div>
            ))}
            {remainingPercentage > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                <span className={`font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                  Unallocated
                </span>
                <span className={`font-mono text-[11px] ${isDark ? 'text-amber-400/80' : 'text-amber-600/80'}`}>
                  {remainingPercentage}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Customizable Allocation Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className={`text-base font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Custom Allocation Sections ({salaryConfig.sections.length})
            </h3>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Adjust percentages and amounts with real-time feedback and ledger spending correlation
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Presets Dropdown */}
            <div className="relative group">
              <button
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isDark
                    ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-200'
                    : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm'
                }`}
              >
                <Sparkles size={13} className="text-indigo-500" />
                <span>Presets</span>
                <ChevronDown size={13} className="text-slate-400" />
              </button>

              <div
                className={`absolute right-0 top-full mt-1.5 w-64 p-2 rounded-xl border shadow-xl z-20 hidden group-hover:block transition-all ${
                  isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
                  Budgeting Frameworks
                </p>
                {SALARY_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset.id)}
                    className={`w-full text-left px-2 py-2 rounded-lg text-xs transition-colors block ${
                      isDark ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-indigo-50/70 text-slate-800'
                    }`}
                  >
                    <div className="font-semibold">{preset.name}</div>
                    <div className="text-[10px] text-slate-400 line-clamp-1">{preset.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleOpenAddSection}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              <Plus size={14} />
              <span>New Section</span>
            </button>
          </div>
        </div>

        {/* Section Cards Grid */}
        {salaryConfig.sections.length === 0 ? (
          <div
            className={`p-8 text-center rounded-2xl border border-dashed ${
              isDark ? 'border-slate-800 bg-slate-900/40 text-slate-400' : 'border-slate-200 bg-slate-50/50 text-slate-500'
            }`}
          >
            <PieChart size={32} className="mx-auto mb-2 text-indigo-500/70" />
            <p className="text-sm font-semibold">No allocation sections configured</p>
            <p className="text-xs mt-1 max-w-sm mx-auto">
              Start by creating custom sections (e.g. Rent, Savings, Groceries) or pick a preset like 50/30/20.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => handleApplyPreset('preset-50-30-20')}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 text-white"
              >
                Apply 50/30/20 Preset
              </button>
              <button
                onClick={handleOpenAddSection}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
                  isDark ? 'border-slate-700 text-slate-300' : 'border-slate-300 text-slate-700'
                }`}
              >
                Create Custom
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {salaryConfig.sections.map((sec) => {
              // Check actual spent this month
              const categoryKey = (sec.categoryMatching || '').toLowerCase().trim();
              const spentThisMonth = currentMonthExpensesByCategory[categoryKey] || 0;
              const hasSpendingLink = Boolean(sec.categoryMatching && sec.categoryMatching !== 'General');
              const spentPercentage = sec.amount > 0 ? Math.min(100, Math.round((spentThisMonth / sec.amount) * 100)) : 0;
              const isOverBudget = spentThisMonth > sec.amount;

              return (
                <div
                  key={sec.id}
                  className={`p-4 rounded-xl border transition-all group relative ${
                    isDark
                      ? 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700'
                      : 'bg-white border-slate-200/90 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:border-indigo-200'
                  }`}
                >
                  {/* Top: Color Accent Line & Title */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-lg shrink-0 shadow-sm"
                        style={{ backgroundColor: sec.color || '#6366F1' }}
                      />
                      <div>
                        <h4 className={`text-sm font-bold tracking-tight ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                          {sec.name}
                        </h4>
                        {sec.categoryMatching && (
                          <span
                            className={`inline-block text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Category: {sec.categoryMatching}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleOpenEditSection(sec)}
                        title="Edit section"
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          isDark ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteSection(sec.id)}
                        title="Delete section"
                        className={`p-1.5 rounded-lg text-xs transition-colors ${
                          isDark ? 'hover:bg-rose-500/20 text-rose-400' : 'hover:bg-rose-50 text-rose-600'
                        }`}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Allocation Numbers & Controls */}
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                          {formatCurrency(sec.amount, currency)}
                        </span>
                        <span className={`text-xs font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          ({sec.percentage}%)
                        </span>
                      </div>

                      {sec.notes && (
                        <span className={`text-[11px] truncate max-w-[150px] ${isDark ? 'text-slate-500' : 'text-slate-400'}`} title={sec.notes}>
                          {sec.notes}
                        </span>
                      )}
                    </div>

                    {/* Percentage Slider Control */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Adjust Percentage:</span>
                        <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {sec.percentage}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step={1}
                        value={sec.percentage}
                        onChange={(e) => handleSliderPercentageChange(sec.id, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                    </div>

                    {/* Actual Spending Comparison (if category is linked) */}
                    {hasSpendingLink && (
                      <div
                        className={`p-2.5 rounded-lg text-xs space-y-1.5 ${
                          isDark ? 'bg-slate-800/40 border border-slate-800' : 'bg-slate-50 border border-slate-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            This Month's Spending:
                          </span>
                          <span
                            className={`font-mono font-semibold text-[11px] ${
                              isOverBudget
                                ? 'text-rose-600 dark:text-rose-400'
                                : isDark
                                ? 'text-slate-200'
                                : 'text-slate-800'
                            }`}
                          >
                            {formatCurrency(spentThisMonth, currency)} / {formatCurrency(sec.amount, currency)}
                          </span>
                        </div>

                        {/* Progress */}
                        <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                          <div
                            style={{ width: `${Math.min(100, spentPercentage)}%` }}
                            className={`h-full transition-all ${
                              isOverBudget
                                ? 'bg-rose-500'
                                : spentPercentage > 85
                                ? 'bg-amber-500'
                                : 'bg-indigo-500'
                            }`}
                          />
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{spentPercentage}% of allocation used</span>
                          <span>{formatCurrency(Math.max(0, sec.amount - spentThisMonth), currency)} remaining</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit Section Modal */}
      {isSectionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div
            className={`w-full max-w-md rounded-2xl border p-5 sm:p-6 shadow-2xl transition-all ${
              isDark
                ? 'bg-slate-900 border-slate-800 text-slate-100'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 mb-4 border-b dark:border-slate-800">
              <h3 className="text-base font-bold flex items-center gap-2">
                <Layers size={18} className="text-indigo-500" />
                <span>{editingSectionId ? 'Edit Allocation Section' : 'Add Custom Allocation Section'}</span>
              </h3>
              <button
                onClick={() => setIsSectionModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSection} className="space-y-4">
              {/* Section Name */}
              <div>
                <label className="block text-xs font-medium mb-1">Section Name *</label>
                <input
                  type="text"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  placeholder="e.g. Rent & Utilities, Food, Emergency Fund"
                  required
                  className={`w-full px-3 py-2 rounded-lg text-xs border transition-all ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                  }`}
                />
              </div>

              {/* Percentage & Calculated Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Target Allocation (%) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      max="100"
                      value={sectionPercentage}
                      onChange={(e) => setSectionPercentage(parseFloat(e.target.value) || 0)}
                      required
                      className={`w-full pr-8 pl-3 py-2 rounded-lg text-xs font-mono font-semibold border transition-all ${
                        isDark
                          ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                          : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                      }`}
                    />
                    <span className="absolute right-3 top-2.5 text-xs text-slate-400">%</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1">Calculated Amount</label>
                  <div
                    className={`px-3 py-2 rounded-lg text-xs font-mono font-bold border truncate ${
                      isDark ? 'bg-slate-800/50 border-slate-700 text-indigo-400' : 'bg-slate-100 border-slate-200 text-indigo-700'
                    }`}
                  >
                    {formatCurrency(Math.round((salaryConfig.amount * (sectionPercentage || 0)) / 100), currency)}
                  </div>
                </div>
              </div>

              {/* Color Palette Choice */}
              <div>
                <label className="block text-xs font-medium mb-1.5">Color Accent</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLOR_PALETTE.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSectionColor(color)}
                      style={{ backgroundColor: color }}
                      className={`w-6 h-6 rounded-full transition-transform active:scale-95 flex items-center justify-center ${
                        sectionColor === color ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                    >
                      {sectionColor === color && <Check size={12} className="text-white drop-shadow" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category Matching for Ledger Tracking */}
              <div>
                <label className="block text-xs font-medium mb-1">
                  Correlate with Ledger Category (Optional)
                </label>
                <select
                  value={sectionCategory}
                  onChange={(e) => setSectionCategory(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-xs border transition-all ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                  }`}
                >
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Flux will track your live monthly expenses in this category against this budget.
                </span>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-medium mb-1">Notes / Description</label>
                <input
                  type="text"
                  value={sectionNotes}
                  onChange={(e) => setSectionNotes(e.target.value)}
                  placeholder="e.g. Direct debited on 2nd, emergency buffer"
                  className={`w-full px-3 py-2 rounded-lg text-xs border transition-all ${
                    isDark
                      ? 'bg-slate-800 border-slate-700 text-white focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                  }`}
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSectionModalOpen(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                    isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
                  }`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                >
                  {editingSectionId ? 'Save Changes' : 'Create Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
